# -*- coding: utf-8 -*-

from openerp.osv import fields, osv


class StockBalance(osv.osv):
    """
    资金状况
    """

    _name = "stock.balance"

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
        return res[0]

    def update_balance(self, cr, uid, context=None):
        """
        更新资产状况
        :param cr:
        :param uid:
        :param context:
        :return:
        """
        # todo 待实现
