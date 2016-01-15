# -*- coding: utf-8 -*-

from openerp.osv import fields, osv
import logging

_logger = logging.getLogger(__name__)


class Quant():

    _qt_key = ""

    def __init__(self, cr, uid, obj, context):
        self._qt_key = obj._qt_key
        self.entrust_cr = obj.pool.get("stock.entrust")
        self.position_cr = obj.pool.get("stock.position")
        self.algorithm_cr = obj.pool.get("qt.algorithm")
        self.section_cr = obj.pool.get("qt.balance.section")
        self.algorithm_log_cr = obj.pool.get("qt.algorithm.log")
        self.algorithm = None
        self.init_algorithm(cr, uid, context=context)

    def init_algorithm(self, cr, uid, context=None):
        if self.algorithm is None:
            ai_ids = self.algorithm_cr.search(cr, uid, [('key', '=', self._qt_key)], context=context)
            self.algorithm = self.algorithm_cr.browse(cr, uid, ai_ids, context=context)

    def write_log(self, cr, uid, msg, context=None):
        """
        策略日志输出
        :param cr:
        :param uid:
        :param msg: 要保存的日志
        :param context:
        :return:
        """
        self.algorithm_log_cr.create(cr, uid, {
            'algorithm_id': self.algorithm.id,
            'log': msg,
        }, context=context)
        cr.commit()

    def balance_section(self, cr, uid, context=None):
        """
        获取策略关联的仓段
        :param cr:
        :param uid:
        :param context:
        :return:
        """
        ids = self.section_cr.search(cr, uid, [('algorithm_id', '=', self.algorithm.id)], context=context)
        if ids:
            if len(ids) > 1:
                ids = ids[0]
            section = self.section_cr.browse(cr, uid, ids, context=context)
            return section
        else:
            return None
