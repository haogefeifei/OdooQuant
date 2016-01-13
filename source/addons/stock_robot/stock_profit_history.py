# -*- coding: utf-8 -*-

from openerp.osv import fields, osv
import logging
from datetime import datetime
import pytz

_logger = logging.getLogger(__name__)

class StockProfitHistory(osv.osv):
    """
    盈亏历史
    """

    # TODO 计算仍然有问题
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
                history_obj.sum_balance / history_obj.principal
            sum_balance_rate_str = str("%.2f" % (sum_balance_rate * 100)) + "%"
            # 浮动盈亏率
            unstable_profits_rate = 0

            for field in field_names:
                result[id][field] = 0
                if field == 'unstable_profits_rate':
                    result[id][field] = unstable_profits_rate
                elif field == 'sum_balance_rate':
                    result[id][field] = sum_balance_rate
                elif field == 'total_account':
                    result[id][field] = total_account
                elif field == 'sum_balance_rate_str':
                    result[id][field] = sum_balance_rate_str
                # elif field == 'total_account':
                #     result[id][field] = total_account
                elif field == 'trend':
                    result[id][field] = trend

        return result

    _name = "stock.profit.history"
    _rec_name = 'date'
    _order = "date desc"

    _columns = {
        'date': fields.date(u'日期', required=True),
        'day_profits': fields.float(u"日盈亏额", size=32, required=True),
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

    def get_now_time(self):
        """获取当前时间"""
        tz = pytz.timezone('Asia/Shanghai')
        return datetime.now(tz).strftime('%Y-%m-%d %H:%M:%S')

    def run_update_profit_history(self, cr, uid, context=None):
        """
        更新盈亏历史定时任务
        :param cr:
        :param uid:
        :param context:
        :return:
        """
        _logger.debug(u"--> 当前时间" + self.get_now_time())



























