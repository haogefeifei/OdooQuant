# -*- coding: utf-8 -*-

from openerp.osv import fields, osv

class QtBalanceSection(osv.osv):

    """
    仓段 - 将所有资金分成多个仓段执行不同策略
    """

    _name = "qt.balance.section"

    _columns = {
        "name":fields.char(u"仓段名称"),
        "net_worth":fields.float(u"当前净值"),
        "init_worth":fields.float(u"初始净值"),
        "profits_rate":fields.float(u"盈利率"),
        "profits_rate_str":fields.char(u"盈利率"),
        'algorithm_id': fields.many2one('qt.algorithm', u'策略'),
    }


class QtAlgorithm(osv.osv):

    """
    策略
    """
    _name = "qt.algorithm"

    _columns = {
        "name":fields.char(u"策略名称", required=True),
        "key":fields.char(u"key", required=True),
        'stock_ids': fields.one2many('qt.algorithm.stock', 'algorithm_id', u'策略股票池', help=u'策略股票池'),
    }

    _sql_constraints = {
        ('key_unique', 'unique(key)', u"该策略key已存在!"),
    }


class QtAlgorithmStock(osv.osv):

    """
    策略股票池
    """

    _name = "qt.algorithm.stock"

    _columns = {
        'stock_id': fields.many2one('stock.basics', u'股票', required=True),
        'algorithm_id': fields.many2one('qt.algorithm', u'策略'),
    }