# -*- coding: utf-8 -*-

from openerp.osv import fields, osv
import logging

_logger = logging.getLogger(__name__)


class BaseQuant(osv.osv):

    _name = "base.quant"
    _qt_key = ""

    def __init__(self, pool, cr):
        init_res = super(BaseQuant, self).__init__(pool, cr)
        self.entrust_cr = self.pool.get("stock.entrust")
        self.position_cr = self.pool.get("stock.position")
        return init_res

    def test(self, cr, uid, context=None):
        _logger.debug(u"------->策略KEY:" + self._qt_key)
        position_ids = self.position_cr.search(cr, uid, [], context=context)
        _logger.debug(u"------->测试查询所有仓位:" + str(position_ids))