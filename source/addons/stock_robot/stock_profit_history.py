# -*- coding: utf-8 -*-

from openerp.osv import fields, osv
import logging
from datetime import datetime
from util.trading_date import *
import pytz

_logger = logging.getLogger(__name__)


class StockProfitHistory(osv.osv):
    """
    盈亏历史
    """

    def _get_line_profit_rate(self, cr, uid, ids, field_names, arg, context=None):
        """计算动态字段
        """
        result = {}
        unstable_profits_rate = 0.00
        unstable_profits_rate_str = "0%"
        sum_balance_rate = 0.00
        # total_account = 0.00
        trend = '-'

        for id in ids:
            result[id] = {}
            history_obj = self.browse(cr, uid, id, context=context)

            # 账户总资产
            total_account = history_obj.market_value + history_obj.cash
            # 涨跌趋势
            if history_obj.day_profits > 0:
                trend = "↑"
            elif history_obj.day_profits < 0:
                trend = "↓"
            else:
                trend = '-'
            # 盈亏率
            sum_balance_rate = 0
            if history_obj.principal != 0:
                sum_balance_rate = (total_account - history_obj.principal) / history_obj.principal
            sum_balance_rate_str = str("%.2f" % (sum_balance_rate * 100)) + "%"
            # 浮动盈亏率
            unstable_profits_rate = 0
            day_profits_rate = 0
            if total_account+ history_obj.day_profits != 0:
                day_profits_rate = history_obj.day_profits / (total_account + history_obj.day_profits)
            if history_obj.unstable_profits - total_account != 0:
                unstable_profits_rate = history_obj.unstable_profits / (total_account - history_obj.unstable_profits)

            for field in field_names:
                result[id][field] = 0
                if field == 'unstable_profits_rate':
                    result[id][field] = unstable_profits_rate
                elif field == 'unstable_profits_rate_str':
                    result[id][field] = str("%.2f" % (unstable_profits_rate * 100)) + "%"
                elif field == 'sum_balance_rate':
                    result[id][field] = sum_balance_rate
                elif field == 'sum_balance_rate_str':
                    result[id][field] = str("%.2f" % (sum_balance_rate * 100)) + "%"
                elif field == 'total_account':
                    result[id][field] = total_account
                elif field == 'sum_balance_rate_str':
                    result[id][field] = sum_balance_rate_str
                elif field == 'trend':
                    result[id][field] = trend
                elif field == 'day_profits_rate':
                    result[id][field] = day_profits_rate
                elif field == 'day_profits_rate_str':
                    result[id][field] = str("%.2f" % (day_profits_rate * 100)) + "%"
        return result

    _name = "stock.profit.history"
    _rec_name = 'date'
    _order = "date desc"

    _columns = {
        'date': fields.date(u'日期', required=True),
        'day_profits': fields.float(u"日盈亏额", size=32, required=True),
        'day_profits_rate': fields.function(_get_line_profit_rate, type='float', multi="profit_line", method=True,
                                                 string=u"日盈亏率"),
        'day_profits_rate_str': fields.function(_get_line_profit_rate, type='char', multi="profit_line",
                                                     method=True, string=u"日盈亏率"),
        'unstable_profits': fields.float(u"浮动盈亏", size=32, required=True),
        'unstable_profits_rate': fields.function(_get_line_profit_rate, type='float', multi="profit_line", method=True,
                                                 string=u"浮动盈亏率"),
        'unstable_profits_rate_str': fields.function(_get_line_profit_rate, type='char', multi="profit_line",
                                                     method=True, string=u"浮动盈亏率"),
        'sum_balance': fields.float(u"盈亏", size=32, required=True),
        'sum_balance_rate': fields.function(_get_line_profit_rate, type='float', multi="profit_line", method=True,
                                            string=u"盈亏率"),
        'sum_balance_rate_str': fields.function(_get_line_profit_rate, type='char', multi="profit_line", method=True,
                                                string=u"盈亏率"),
        'total_account': fields.function(_get_line_profit_rate, type='float', multi="profit_line", method=True,
                                         string=u"账户总资产"),
        'market_value': fields.float(u"市值", size=32, required=True),
        'cash': fields.float(u"现金", size=32, required=True),
        'principal': fields.float(u"本金", size=32, required=True),
        'trend': fields.function(_get_line_profit_rate, type='char', multi="profit_line", method=True, help=u"涨跌趋势"),
        'is_section': fields.boolean(u"是否是仓段盈亏记录"),
        'section_id': fields.many2one('qt.balance.section', u'所属仓段'),
    }

    _defaults = {
        'date': fields.date.context_today,
        'is_section': False
    }

    def checkTodayStockOpened(self):
        """
        检查今天是否开盘
        :return: 开盘 True
        """
        pass

    def get_today(self):
        """获取当前日期"""
        tz = pytz.timezone('Asia/Shanghai')
        return datetime.now(tz).date()

    def get_now_time(self):
        """获取当前时间"""
        tz = pytz.timezone('Asia/Shanghai')
        return datetime.now(tz)

    def update_profit_history(self, cr, uid, context=None):
        """
        更新盈亏历史
        :param cr:
        :param uid:
        :param context:
        :return:
        """

        today = self.get_today()
        # _logger.debug(u"------> 当前日期" + str(today))
        stock_position_cr = self.pool.get("stock.position")
        section_cr = self.pool.get("qt.balance.section")
        history_cr = self.pool.get("stock.profit.history")

        # 计算今天总盈亏
        CNY_balance = self.pool.get("stock.balance").get_CNY_balance(cr, uid, context)
        position_ids = stock_position_cr.search(cr, uid, [], context=context)
        position_list = stock_position_cr.browse(cr, uid, position_ids, context=context)
        day_profits = 0  # 日盈亏额
        unstable_profits = 0  # 浮动盈亏
        sum_balance = 0  # 盈亏
        cash = CNY_balance.enable_balance  # 现金
        market_value = 0  # 市值
        principal = CNY_balance.principal  # 本金

        for pos in position_list:
            day_profits += pos.day_profits
            market_value += pos.market_value
            unstable_profits += pos.income_balance

        # 计算总盈亏
        history_ids = history_cr.search(cr, uid, [], context=context)
        history_list = history_cr.read(cr, uid, history_ids, ['day_profits'], context=context)
        for his in history_list:
            sum_balance += his['day_profits']

        ids = history_cr.search(cr, uid, [('date', '=', today)], context=context)
        if len(ids) < 1:
            history_cr.create(cr, uid, {
                'date': today,
                'day_profits': day_profits,
                'unstable_profits': unstable_profits,
                'sum_balance': sum_balance,
                'cash': cash,
                'market_value': market_value,
                'principal': principal
            }, context=context)
            cr.commit()
        else:
            history_cr.write(cr, uid, ids, {
                'day_profits': day_profits,
                'unstable_profits': unstable_profits,
                'sum_balance': sum_balance,
                'cash': cash,
                'market_value': market_value,
                'principal': principal
            }, context=context)
            cr.commit()

        # 计算各仓段日盈亏
        section_ids = section_cr.search(cr, uid, [], context=context)
        if section_ids:
            for section_id in section_ids:
                section = section_cr.browse(cr, uid, section_id, context=context)
                position_ids = stock_position_cr.search(cr, uid, [('section_id', '=', section_id)], context=context)
                position_list = stock_position_cr.browse(cr, uid, position_ids, context=context)
                day_profits = 0  # 日盈亏额
                unstable_profits = 0  # 浮动盈亏
                sum_balance = 0  # 盈亏
                cash = section.enable_balance  # 现金
                market_value = 0  # 市值
                principal = section.init_worth  # 本金

                for pos in position_list:
                    day_profits += pos.day_profits
                    market_value += pos.market_value
                    unstable_profits += pos.income_balance

                # 计算总盈亏
                # history_ids = history_cr.search(cr, uid, [('section_id', '=', section_id), ('is_section', '=', True)],
                #                                 context=context)
                # history_list = history_cr.read(cr, uid, history_ids, ['day_profits'], context=context)
                # for his in history_list:
                #     sum_balance += his['day_profits']

                sum_balance =  cash + market_value - section.init_worth

                ids = history_cr.search(cr, uid, [('date', '=', today), ('section_id', '=', section_id),
                                                  ('is_section', '=', True)], context=context)
                if len(ids) < 1:
                    history_cr.create(cr, uid, {
                        'date': today,
                        'day_profits': day_profits,
                        'unstable_profits': unstable_profits,
                        'sum_balance': sum_balance,
                        'cash': cash,
                        'market_value': market_value,
                        'principal': principal,
                        'section_id': section_id,
                        'is_section': True
                    }, context=context)
                    cr.commit()
                else:
                    history_cr.write(cr, uid, ids, {
                        'day_profits': day_profits,
                        'unstable_profits': unstable_profits,
                        'sum_balance': sum_balance,
                        'cash': cash,
                        'market_value': market_value,
                        'principal': principal
                    }, context=context)
                    cr.commit()

    def run_update_profit_history(self, cr, uid, context=None):
        """
        更新盈亏历史定时任务
        :param cr:
        :param uid:
        :param context:
        :return:
        """

        if is_trading_date(self.get_now_time()):
             _logger.debug(u">>>>>>>>>> 当前日期是交易日")
             self.update_profit_history(cr, uid, context=context)