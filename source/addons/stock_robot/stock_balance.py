# -*- coding: utf-8 -*-

from openerp.osv import fields, osv
from quant_trader import *

class StockBalance(osv.osv):
    """
    资金状况
    """

    _name = "stock.balance"
    _rec_name = 'money_type'

    _columns = {
        'asset_balance': fields.float(u"资产总值", size=32, required=True),
        'current_balance': fields.float(u"当前余额", size=32, required=True),
        'enable_balance': fields.float(u"可用金额", size=32, required=True),
        'market_value': fields.float(u"证券市值", size=32, required=True),
        'money_type': fields.char(u"币种", size=10, required=True),
        'pre_interest': fields.float(u"预计利息", size=32, required=True),
    }

    def get_CNY_balance(self, cr, uid, context=None):
        """
        获取人民资产状况
        :param cr:
        :param uid:
        :param context:
        :return:
        """
        balance_cr = self.pool.get("stock.balance")
        ids = balance_cr.search(cr, uid, [('money_type', '=', '人民币')], context=context)
        if len(ids) < 1:
            return None
        res = balance_cr.browse(cr, uid, ids, context=context)
        return res

    def update_balance(self, cr, uid, context=None):
        """
        更新资产状况
        :param cr:
        :param uid:
        :param context:
        :return:
        """
        trader = Trader().trader
        balance_list = trader.balance
        balance_cr = self.pool.get("stock.balance")
        # out(balance_list) # 打印
        for balance in balance_list:
            ids = balance_cr.search(cr, uid, [('money_type', '=', balance['money_type'])], context=context)
            if len(ids) < 1:
                balance_cr.create(cr, uid, {
                    'asset_balance': float(balance['asset_balance']),
                    'current_balance': float(balance['current_balance']),
                    'enable_balance': float(balance['enable_balance']),
                    'market_value': float(balance['market_value']),
                    'money_type': balance['money_type'],
                    'pre_interest': float(balance['pre_interest'])
                }, context=context)
                cr.commit()
            else:
                # write_ids = balance_cr.search(cr, uid, [('money_type', '=', balance['money_type'])])
                balance_cr.write(cr, uid, ids, {
                    'asset_balance': float(balance['asset_balance']),
                    'current_balance': float(balance['current_balance']),
                    'enable_balance': float(balance['enable_balance']),
                    'market_value': float(balance['market_value']),
                    'pre_interest': float(balance['pre_interest'])
                }, context=context)
                cr.commit()
