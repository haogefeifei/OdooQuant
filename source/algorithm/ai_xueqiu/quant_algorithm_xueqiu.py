# -*- coding: utf-8 -*-

from openerp.osv import fields, osv
from quant import Quant
import logging
import time

_logger = logging.getLogger(__name__)


class QtAlgorithmXueQiu(osv.osv):
    """
    雪球追买策略
    """

    _name = "qt.algorithm.xueqiu"
    _qt_key = "qt_algorithm_xueqiu"

    def before_trading(self, cr, uid, mail=[], context=None):
        """
        每天交易开始前被调用
        """
        # todo
        pass


    def handle_data(self, cr, uid, mail=[], context=None):
        running = True
        while running:
            self.tick(cr, uid, context=context)
            time.sleep(1)


    @Quant.tick(is_trading_date=True)
    def tick(self, cr, uid, context=None):
        cr.commit()
        qt = Quant(self, cr, uid, context)
        section = qt.balance_section(cr, uid, context)
        if section != None:
            _logger.debug(u"----->%s 开始操作->%s" % (qt.algorithm.name, section.name))
            _logger.debug("------>uid:" + str(uid))
            qt.get_setting(cr, uid, context=context)