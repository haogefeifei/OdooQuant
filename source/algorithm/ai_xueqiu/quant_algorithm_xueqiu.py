# -*- coding: utf-8 -*-

from quant_base import BaseQuant
import time
import logging

_logger = logging.getLogger(__name__)

class QtAlgorithmXueQiu(BaseQuant):

    """
    雪球追买策略
    """

    _name = "qt.algorithm.xueqiu"
    _qt_key = "qt_algorithm_xueqiu"

    def handle_data(self, cr, uid, mail=[], context=None):
        self.test(cr, uid, context)
        # while True:
        #     time.sleep(1)
        #     _logger.debug(u"------->策略KEY:" + self._qt_key)
