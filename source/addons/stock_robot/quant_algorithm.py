# -*- coding: utf-8 -*-

from openerp.osv import fields, osv
from datetime import datetime
import pytz

class QtAlgorithm(osv.osv):
    """
    策略
    """
    _name = "qt.algorithm"
    _columns = {
        "name": fields.char(u"策略名称", required=True),
        "key": fields.char(u"key", required=True),
        "mark": fields.text(u"说明"),
        'stock_ids': fields.one2many('qt.algorithm.stock', 'algorithm_id', u'策略股票池', help=u'策略股票池'),
        'log_ids': fields.one2many('qt.algorithm.log', 'algorithm_id', u'策略运行日志', help=u'策略运行日志'),
        'setting_ids': fields.one2many('qt.algorithm.setting', 'algorithm_id', u'策略参数', help=u'策略参数'),
    }

    _sql_constraints = {
        ('key_unique', 'unique(key)', u"该策略key已存在!"),
    }


class QtAlgorithmSetting(osv.osv):
    """
    策略参数
    """
    _name = "qt.algorithm.setting"
    _columns = {
        'algorithm_id': fields.many2one('qt.algorithm', u'策略'),
        'key': fields.char(u'key'),
        'value': fields.char(u'value')
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


class QtAlgorithmLog(osv.osv):

    """
    策略运行日志
    """

    _name = "qt.algorithm.log"
    _order = "date desc"
    _rec_name = 'date'

    _columns = {
        'date': fields.datetime(u"创建时间", required=True),
        'algorithm_id': fields.many2one('qt.algorithm', u'策略'),
        'log': fields.text(u"日志内容")
    }

    def get_now_time(self, cr, uid, ids, context=None):
        """获取当前时间"""
        tz = pytz.timezone('UTC')
        return datetime.now(tz).strftime('%Y-%m-%d %H:%M:%S')

    _defaults = {
        'date': get_now_time
    }










