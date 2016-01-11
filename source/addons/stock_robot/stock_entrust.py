# -*- coding: utf-8 -*-

from openerp.osv import fields, osv
from datetime import datetime,timedelta
from quant_trader import *
import pytz
import logging

_logger = logging.getLogger(__name__)


class StockEntrust(osv.osv):
    """
    委托单
    """

    _name = "stock.entrust"
    _order = "id desc"

    _columns = {
        'business_amount': fields.integer(u"成交数量", size=32, required=True),
        'business_price': fields.float(u"成交价格", size=32, required=True),
        'entrust_amount': fields.integer(u"委托数量", size=32, required=True),
        'entrust_bs': fields.selection((('buy', u'买入'), ('sale', u'卖出')), u'买卖方向'),
        'entrust_no': fields.integer(u"委托编号", required=True),
        'entrust_price': fields.char(u"委托价格", required=True),
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
        stock_obj = basics_obj.read(cr, uid, vals['stock_id'], ['name', 'code', 'id'], context)
        vals['stock_name'] = stock_obj['name']
        vals['stock_code'] = stock_obj['code']

        # 检查交易密码
        if vals['pwd'] != '666666':
            raise osv.except_osv(u"错误", u"交易密码错误")

        # 首先要区分是买入还是卖出
        if vals['entrust_bs'] == 'buy':
            # 买入

            # todo 检查是否是买入时间

            # todo 检查委托数量是否正确

            # 检查是否足够的资金操作
            CNY_balance = self.pool.get("stock.balance").get_CNY_balance(cr, uid, context)

            if CNY_balance is None:
                raise osv.except_osv(u"错误", u"没有可用的人民币资产")

            # 如果可用资金不足以买入股票
            handle_balance = vals['entrust_amount'] * float(vals['entrust_price'])
            if CNY_balance.enable_balance < handle_balance:
                raise osv.except_osv(u"错误", u"可用资金不足,无法买入")

            # todo 没有问题的话, 调用买入股票接口(还需要处理返回的委托单号)
            self.buy_stock(cr, uid, vals['stock_code'], float(vals['entrust_price']), int(vals['entrust_amount']),
                           context)
        else:
            # todo 卖出
            pass

        # todo 更新资金

        vals['pwd'] = "******"  # 处理掉交易密码
        return super(StockEntrust, self).create(cr, uid, vals, context)

    def buy_stock(self, cr, uid, code, price, amount, context=None):
        """
        创建真实买入委托单
        :param cr:
        :param uid:
        :param context:
        :return: 委托单号
        """
        # todo 待实现
        trader = Trader().trader
        _logger.debug(u"--> 创建买入委托单:" + code + "  " + str(price) + "  " + str(amount))

        # [{'entrust_no': '委托编号',
        #   'init_date': '发生日期',
        #   'batch_no': '委托批号',
        #   'report_no': '申报号',
        #   'seat_no': '席位编号',
        #   'entrust_time': '委托时间',
        #   'entrust_price': '委托价格',
        #   'entrust_amount': '委托数量',
        #   'stock_code': '证券代码',
        #   'entrust_bs': '买卖方向',
        #   'entrust_type': '委托类别',
        #   'entrust_status': '委托状态',
        #   'fund_account': '资金帐号',
        #   'error_no': '错误号',
        #   'error_info': '错误原因'}]

        # trader.buy('162411', price=0.55, amount=100)

    def sell_stock(self, cr, uid, context=None):
        """
        创建真实卖出委托单
        :param cr:
        :param uid:
        :param context:
        :return:
        """
        # todo 待实现
        pass

    def onchange_stock(self, cr, uid, ids, stock_id, context=None):
        values = {'value': {}}
        stock = self.pool.get('stock.basics').browse(cr, uid, stock_id, context=context)
        values['value']['entrust_price'] = stock.current_price
        return values

    def update_entrust(self, cr, uid, context=None):
        """
        委托单
        """
        trader = Trader().trader
        entrust_list = trader.entrust
        entrust_cr = self.pool.get("stock.entrust")
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
