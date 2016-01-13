# -*- coding: utf-8 -*-

from openerp.osv import fields, osv
from datetime import datetime
import logging

_logger = logging.getLogger(__name__)


class QtBalanceSection(osv.osv):
    """
    仓段 - 将所有资金分成多个仓段执行不同策略
    """

    def _get_section_data(self, cr, uid, ids, field_names, arg, context=None):
        result = {}
        position_cr = self.pool.get("stock.position")  # 持仓对象
        for id in ids:
            result[id] = {}
            net_worth = 0  # 证券市值

            position_ids = position_cr.search(cr, uid, [
                ('section_id', '=', id),
                ('state', '=', 'active')
            ], context=context)
            if position_ids:
                position_list = position_cr.browse(cr, uid, position_ids, context=context)
                for pos in position_list:
                    net_worth += pos.last_price * pos.current_amount

            section = self.browse(cr, uid, id, context=context)
            asset_balance = section.enable_balance + net_worth  # 资产总值
            profits_rate = asset_balance / section.init_worth - 1  # 盈利率

            for field in field_names:
                result[id][field] = 0
                if field == 'asset_balance':
                    result[id][field] = asset_balance
                elif field == 'net_worth':
                    result[id][field] = net_worth
                elif field == 'profits_rate':
                    result[id][field] = profits_rate
                elif field == 'profits_rate_str':
                    result[id][field] = str("%.2f" % (profits_rate * 100)) + "%"

        return result

    _name = "qt.balance.section"
    _columns = {
        "name": fields.char(u"仓段名称"),
        "enable_balance": fields.float(u"可用金额"),
        'asset_balance': fields.function(_get_section_data, type='float', multi="section_line", method=True,
                                         help=u"资产总值"),
        "net_worth": fields.function(_get_section_data, type='float', multi="section_line", method=True, help=u"证券市值"),
        "init_worth": fields.float(u"初始金额"),
        "profits_rate": fields.function(_get_section_data, type='float', multi="section_line", method=True,
                                        help=u"盈利率"),
        "profits_rate_str": fields.function(_get_section_data, type='char', multi="section_line", method=True,
                                            help=u"盈利率"),
        'algorithm_id': fields.many2one('qt.algorithm', u'策略'),
        'move_ids': fields.one2many('stock.entrust', 'section_id', u'仓段委托单', help=u'仓段委托单'),
        'position_ids': fields.one2many('stock.position', 'section_id', u'仓段持仓股票', help=u'仓段持仓股票',
                                        domain=[('state', '=', 'active')]),
        'history_ids': fields.one2many('stock.profit.history', 'section_id', u'盈亏历史', help=u'盈亏历史'),
    }

    _defaults = {
        'profits_rate': 0,
        'profits_rate_str': '0%',
    }
