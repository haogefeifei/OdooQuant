# -*- coding: utf-8 -*-

from openerp.osv import fields, osv
from datetime import datetime
import logging

_logger = logging.getLogger(__name__)


class QtBalanceSection(osv.osv):
    """
    仓段 - 将所有资金分成多个仓段执行不同策略
    """

    _name = "qt.balance.section"
    _columns = {
        "name": fields.char(u"仓段名称"),
        "net_worth": fields.float(u"当前净值"),
        "init_worth": fields.float(u"初始净值"),
        "profits_rate": fields.float(u"盈利率"),
        "profits_rate_str": fields.char(u"盈利率"),
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
