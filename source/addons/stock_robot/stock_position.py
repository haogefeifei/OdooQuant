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
    _rec_name = 'stock_code'

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
        'trend': fields.function(_get_stock_trend, type='char', multi="position_line", method=True, help=u"涨跌趋势"),
        'section_id': fields.many2one('qt.balance.section', u'所属仓段'),
    }

    def update_position(self, cr, uid, context=None):
        """
        更新持仓股票
        """
        trader = Trader().trader
        position_cr = self.pool.get("stock.position")
        position_list = trader.position
        for position in position_list:
            ids = position_cr.search(cr, uid, [('stock_id.code', '=', position['stock_code'])], context=context)
            if len(ids) < 1:
                stock = self.pool.get('stock.basics').get_stock_by_code(cr, uid, position['stock_code'])
                position_cr.create(cr, uid, {
                    'stock_id': stock.id,
                    'stock_code': stock.code,
                    'position_str': position['position_str'],
                    'market_value': float(position['market_value']),
                    'last_price': float(position['last_price']),
                    'keep_cost_price': float(position['keep_cost_price']),
                    'income_balance': float(position['income_balance']),
                    'cost_price': float(position['cost_price']),
                    'enable_amount': int(position['enable_amount']),
                    'current_amount': int(position['current_amount']),
                }, context=context)
                cr.commit()
            else:
                position_cr.write(cr, uid, ids, {
                    'position_str': position['position_str'],
                    'market_value': float(position['market_value']),
                    'last_price': float(position['last_price']),
                    'keep_cost_price': float(position['keep_cost_price']),
                    'income_balance': float(position['income_balance']),
                    'cost_price': float(position['cost_price']),
                    'enable_amount': int(position['enable_amount']),
                    'current_amount': int(position['current_amount']),
                }, context=context)

        # 删除已经不存在的持仓
        ids = position_cr.search(cr, uid, [], context=context)
        pos_obj_list = position_cr.read(cr, uid, ids, ['stock_code', 'id'], context)
        for pos_list in pos_obj_list:
            b = True
            for position in position_list:
                if position['stock_code'] == pos_list['stock_code']:
                    b = False
            if b:
                self.pool.get('stock.position').unlink(cr, uid, pos_list['id'], context=context)



    def run_update(self, cr, uid, context=None):
        """
        更新持仓/资金/委托单信息 定时任务
        """
        # 更新资金信息 --------------------
        self.pool.get("stock.balance").update_balance(cr, uid, context)

        # 更新持仓信息 --------------------
        self.pool.get("stock.position").update_position(cr, uid, context)

        # 更新委托单信息 ------------------
        self.pool.get("stock.entrust").update_entrust(cr, uid, context)















