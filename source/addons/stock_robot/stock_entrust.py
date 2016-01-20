# -*- coding: utf-8 -*-

from openerp.osv import fields, osv
from datetime import datetime, timedelta
from quant_trader import *
import pytz
import logging

_logger = logging.getLogger(__name__)


class StockEntrust(osv.osv):
    """
    委托单
    """

    _name = "stock.entrust"
    _rec_name = 'entrust_no'
    _order = "report_time desc"

    _columns = {
        'business_amount': fields.integer(u"成交数量", size=32, required=True),
        'business_price': fields.float(u"成交价格", size=32, required=True),
        'entrust_amount': fields.integer(u"委托数量", size=32, required=True),
        'entrust_bs': fields.selection((('buy', u'买入'), ('sale', u'卖出')), u'买卖方向'),
        'entrust_no': fields.integer(u"委托编号", required=True),
        'entrust_price': fields.float(u"委托价格", required=True),
        'state': fields.selection((
            ('done', u'已成'),
            ('cancel', u'废单'),
            ('report', u'已报')), u'委托状态'),
        'report_time': fields.datetime(u"申报时间", required=True),
        'stock_code': fields.char(u"证券代码"),
        'stock_name': fields.char(u"证券名称"),
        'pwd': fields.char(u"交易密码"),
        'stock_id': fields.many2one('stock.basics', u'股票', required=True),
        'section_id': fields.many2one('qt.balance.section', u'所属仓段'),
        'is_clear': fields.boolean(u'是否已清算')
    }

    def get_now_time(self, cr, uid, ids, context=None):
        """获取当前时间"""
        tz = pytz.timezone('UTC')
        return datetime.now(tz).strftime('%Y-%m-%d %H:%M:%S')

    def transformation_report_time(self, time):
        tz = pytz.timezone('UTC')
        qz = datetime.now(tz).strftime('%Y%m%d')
        hz = datetime.strftime(datetime.strptime(time, '%H%M%S') - timedelta(hours=8), '%H:%M:%S')
        return qz + " " + hz

    _defaults = {
        'is_clear': False,
        'entrust_no': '000000',
        'entrust_bs': 'buy',
        'state': 'report',
        'business_price': 0.00,
        'business_amount': 0,
        'entrust_amount': 100,
        'report_time': get_now_time,
    }

    def button_cancel(self, cr, uid, ids, context=None):
        """ 取消状态.
        """
        # 撤销真实的委托单
        entrust = self.pool.get('stock.entrust').browse(cr, uid, ids, context=context)
        if entrust.entrust_no != "0":
            trader = Trader().trader
            trader.cancel_entrust(entrust.entrust_no, entrust.stock_code)

        self.write(cr, uid, ids, {'state': 'cancel'}, context=context)
        return True

    def create(self, cr, uid, vals, context=None):

        """重写创建方法
        """
        _logger.debug(u"run 委托单 -> create!")

        basics_obj = self.pool.get('stock.basics')
        section_cr = self.pool.get("qt.balance.section")
        position_cr = self.pool.get("stock.position")
        stock_obj = basics_obj.read(cr, uid, vals['stock_id'], ['name', 'code', 'id'], context)
        vals['stock_name'] = stock_obj['name']
        vals['stock_code'] = stock_obj['code']

        # 检查交易密码
        if vals['pwd'] != '666666':
            raise osv.except_osv(u"错误", u"交易密码错误")

        # todo 检查是否是买入时间

        # 检查委托数量是否正确
        r = divmod(vals['entrust_amount'], 100)
        if r[0] < 1 or r[1] != 0:
            raise osv.except_osv(u"错误", u"委托数量有误")

        # 首先要区分是买入还是卖出
        if vals['entrust_bs'] == 'buy':
            # 买入

            # 检查是否足够的资金操作
            CNY_balance = self.pool.get("stock.balance").get_CNY_balance(cr, uid, context)
            if CNY_balance is None:
                raise osv.except_osv(u"错误", u"没有可用的人民币资产")

            # 如果可用资金不足以买入股票
            handle_balance = vals['entrust_amount'] * float(vals['entrust_price'])
            if CNY_balance.enable_balance < handle_balance:
                raise osv.except_osv(u"错误", u"可用资金不足,无法买入")

            if vals['section_id']:
                section = section_cr.browse(cr, uid, vals['section_id'], context=context)
                if section.enable_balance < handle_balance:
                    raise osv.except_osv(u"错误", u"仓段可用资金不足,无法买入")

            # 如果是仓段委托单 更新可用资金资金
            if vals['section_id']:
                section = section_cr.browse(cr, uid, vals['section_id'], context=context)
                enable_balance = section.enable_balance - vals['entrust_amount'] * float(
                        vals['entrust_price']) - self.get_poundage(
                        vals['stock_code'],
                        vals['entrust_amount'] * float(vals['entrust_price']), vals['entrust_bs'])
                section_cr.write(cr, uid, vals['section_id'], {
                    'enable_balance': enable_balance
                }, context=context)
                cr.commit()

            # 调用买入股票接口(返回的委托单号)
            vals['entrust_no'] = self.buy_stock(cr, uid, vals['stock_code'], float(vals['entrust_price']),
                                                int(vals['entrust_amount']),
                                                context)
        else:
            # 卖出
            # 检查是否持有该股票
            ids = position_cr.search(cr, uid, [
                ('stock_id.id', '=', vals['stock_id']),
                ('state', '=', 'active')
            ], context=context)
            if not ids:
                raise osv.except_osv(u"错误", u"没有持有该股票,无法卖出")
            # 检查是否有足够的可卖数量
            position = position_cr.browse(cr, uid, ids, context=context)
            if position.enable_amount < vals['entrust_amount']:
                raise osv.except_osv(u"错误", u"没有足够的可卖数量,无法卖出")

            vals['entrust_no'] = self.sell_stock(cr, uid, vals['stock_code'], float(vals['entrust_price']),
                                                 int(vals['entrust_amount']),
                                                 context)

        vals['pwd'] = "******"  # 处理掉交易密码
        id = super(StockEntrust, self).create(cr, uid, vals, context)
        cr.commit()

        # 更新所有数据
        position_cr.run_update(cr, uid, context=context)
        return id

    def buy_stock(self, cr, uid, code, price, amount, context=None):
        """
        创建真实买入委托单
        :param cr:
        :param uid:
        :param context:
        :return: 委托单号
        """
        trader = Trader().trader
        r = trader.buy(code, price=price, amount=amount)
        return r['entrust_no']

    def sell_stock(self, cr, uid, code, price, amount, context=None):
        """
        创建真实卖出委托单
        :param cr:
        :param uid:
        :param context:
        :return:
        """
        trader = Trader().trader
        r = trader.sell(code, price=price, amount=amount)
        return r['batch_no']

    def onchange_stock(self, cr, uid, ids, stock_id, context=None):
        values = {'value': {}}
        stock = self.pool.get('stock.basics').browse(cr, uid, stock_id, context=context)
        values['value']['entrust_price'] = stock.current_price
        return values

    def get_poundage(self, stock_code, balance, entrust_bs='buy'):
        """
        计算手续费
        :param stock_code: 股票代码
        :param balance: 交易金额
        :param entrust_bs: 买卖方向
        :return:手续费
        """
        commission = 5  # 佣金
        transfer = 0  # 过户费
        poundage = 0
        other = 0.5  # 其他手续费

        if balance * 0.00025 > 5:
            commission = balance * 0.00025
        if stock_code[:1] in ['5', '6', '9']:
            transfer = balance * 0.00002
        if entrust_bs == 'buy':
            poundage = commission + transfer + other
        elif entrust_bs == 'sale':
            poundage = balance * 0.001 + commission + transfer + other
        return round(poundage, 2)

    def update_entrust(self, cr, uid, context=None):
        """
        委托单
        """
        trader = Trader().trader
        entrust_list = trader.entrust
        entrust_cr = self.pool.get("stock.entrust")
        position_cr = self.pool.get("stock.position")
        section_cr = self.pool.get("qt.balance.section")
        # out(entrust_list)  # 打印
        for entrust in entrust_list:
            ids = entrust_cr.search(cr, uid, [('entrust_no', '=', entrust['entrust_no'])], context=context)
            if entrust['entrust_no'] == "":
                continue
            if entrust['entrust_status'] == u'已报':
                entrust_status = 'report'
            elif entrust['entrust_status'] == u'已成':
                entrust_status = 'done'
            else:
                entrust_status = 'cancel'
            if len(ids) < 1:
                if entrust['entrust_bs'] == u'买入':
                    entrust_bs = 'buy'
                else:
                    entrust_bs = 'sale'
                stock = self.pool.get('stock.basics').get_stock_by_code(cr, uid, entrust['stock_code'])
                super(StockEntrust, self).create(cr, uid, {
                    'business_amount': int(entrust['business_amount']),
                    'business_price': float(entrust['business_price']),
                    'entrust_amount': int(entrust['entrust_amount']),
                    'entrust_bs': entrust_bs,
                    'entrust_no': entrust['entrust_no'],
                    'entrust_price': float(entrust['entrust_price']),
                    'state': entrust_status,
                    'report_time': self.transformation_report_time(entrust['report_time']),
                    'stock_code': entrust['stock_code'],
                    'stock_name': entrust['stock_name'],
                    'stock_id': stock.id,
                }, context=context)
                cr.commit()
            else:
                # write_ids = balance_cr.search(cr, uid, [('money_type', '=', balance['money_type'])])
                entrust_cr.write(cr, uid, ids, {
                    'business_amount': int(entrust['business_amount']),
                    'business_price': float(entrust['business_price']),
                    'state': entrust_status,
                }, context=context)
                cr.commit()

        _logger.debug(u"----->进行仓段委托清算")
        ids = entrust_cr.search(cr, uid, [('is_clear', '=', False), ('section_id', '!=', False)], context=context)
        if ids:
            _logger.debug(u"----->需要清算的委托单数量:" + str(len(ids)))
            entrust_clear_list = entrust_cr.browse(cr, uid, ids, context=context)
            for entrust in entrust_clear_list:
                section = section_cr.browse(cr, uid, entrust.section_id.id, context=context)
                if entrust.state == 'done' and entrust.entrust_bs == 'sale':
                    # 卖出成功 将资金加回 仓段可用资金
                    enable_balance = section.enable_balance + entrust.business_price * entrust.business_amount - self.get_poundage(
                            entrust.stock_code,
                            entrust.business_price * entrust.business_amount,
                            entrust.entrust_bs)
                elif entrust.state == 'done' and entrust.entrust_bs == 'buy':
                    # 买入以最终成交价格为准
                    enable_balance = section.enable_balance + entrust.entrust_price * entrust.entrust_amount
                    enable_balance = enable_balance - entrust.business_price * entrust.business_amount
                elif entrust.state == 'cancel' and entrust.entrust_bs == 'buy':
                    # 撤单 将资金加回 仓段可用资金
                    enable_balance = section.enable_balance + entrust.entrust_price * entrust.entrust_amount + self.get_poundage(
                            entrust.stock_code,
                            entrust.entrust_price * entrust.entrust_amount,
                            str(entrust.entrust_bs))
                else:
                    enable_balance = section.enable_balance

                if entrust.state != 'report':
                    # 挂钩持仓股票
                    if entrust.entrust_bs == 'buy' and entrust.state == 'done':
                        position_ids = position_cr.search(cr, uid, [('section_id', '=', False),
                                                                    ('stock_id.id', '=', entrust.stock_id.id)],
                                                          context=context)
                        if position_ids:
                            position_cr.write(cr, uid, position_ids, {
                                'section_id': entrust.section_id.id}, context=context)
                            section_cr.write(cr, uid, entrust.section_id.id, {
                                'enable_balance': enable_balance
                            }, context=context)
                            entrust_cr.write(cr, uid, entrust.id, {
                                'is_clear': True
                            }, context=context)
                            cr.commit()
                    else:
                        section_cr.write(cr, uid, entrust.section_id.id, {
                            'enable_balance': enable_balance
                        }, context=context)
                        entrust_cr.write(cr, uid, entrust.id, {
                            'is_clear': True
                        }, context=context)
                        cr.commit()
