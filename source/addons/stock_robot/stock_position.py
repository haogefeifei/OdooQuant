# -*- coding: utf-8 -*-

from openerp.osv import fields, osv
from quant_trader import *
import logging

_logger = logging.getLogger(__name__)

class StockPosition(osv.osv):
    """
    持仓股票
    """

    def _get_stock_trend(self, cr, uid, ids, field_names, arg, context=None):
        result = {}
        for id in ids:
            result[id] = {}
            position_obj = self.browse(cr, uid, id, context=context)
            for field in field_names:
                result[id][field] = 0
                if field == 'trend':
                    if position_obj.income_balance > 0:
                        result[id][field] = "↑"
                    else:
                        result[id][field] = "↓"
                elif field == 'stock_code':
                    result[id][field] = self.pool.get('stock.basics').get_stock_code(cr, uid, position_obj.stock_id.id)
        return result

    _name = "stock.position"

    _columns = {
        'stock_id': fields.many2one('stock.basics', u'股票', required=True),
        'stock_code': fields.function(_get_stock_trend, type='char', multi="position_line", method=True, help=u"证券代码"),
        'position_str': fields.char(u"定位串", size=64),
        'market_value': fields.float(u"证券市值", size=64, required=True),
        'last_price': fields.float(u"最新价", size=64, required=True),
        'keep_cost_price': fields.float(u"保本价", size=64, required=True),
        'income_balance': fields.float(u"摊薄浮动盈亏", size=64, required=True),
        'cost_price': fields.float(u"摊薄成本价", size=64, required=True),
        'enable_amount': fields.integer(u"可卖数量", size=64, required=True),
        'current_amount': fields.integer(u"当前数量", size=64, required=True),
        'trend': fields.function(_get_stock_trend, type='char', multi="position_line", method=True, help=u"涨跌趋势")
    }

    def update(self, cr, uid, ids, context=None):
        """
        更新持仓股票
        """
        # todo 待实现
        pass

    def run_update(self, cr, uid, context=None):
        """
        更新持仓/资金/委托单信息
        """
        _logger.debug(u"run -----> 更新持仓/资金/委托单信息!")

        trader = Trader().trader
        out(trader.balance)
        out(trader.position)

        # todo 更新资金信息

        # todo 更新持仓信息

        # todo 更新委托单信息

