# -*- coding: utf-8 -*-

from openerp.osv import fields, osv
from quant import Quant
import logging

_logger = logging.getLogger(__name__)


class QtAlgorithmXueQiu(osv.osv):
    """
    雪球追买策略
    """

    _name = "qt.algorithm.xueqiu"
    _qt_key = "qt_algorithm_xueqiu"

    @Quant.tick(is_trading_date=True)
    def handle_data(self, cr, uid, mail=[], context=None):
        qt = Quant(self, cr, uid, context)
        section = qt.balance_section(cr, uid, context)
        if section != None:
            _logger.debug(u"----->%s 开始操作->%s" % (qt.algorithm.name, section.name))
            _logger.debug("------>uid:" + str(uid))
