# -*- coding: utf-8 -*-

from openerp.osv import fields, osv

class QtAlgorithm(osv.osv):
    """
    策略
    """
    _name = "qt.algorithm"
    _columns = {
        "name": fields.char(u"策略名称", required=True),
        "key": fields.char(u"key", required=True),
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
    _rec_name = 'stock_id'
    _columns = {
        'stock_id': fields.many2one('stock.basics', u'股票', required=True),
        'algorithm_id': fields.many2one('qt.algorithm', u'策略'),
    }
