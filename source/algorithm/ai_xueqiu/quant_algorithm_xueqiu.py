# -*- coding: utf-8 -*-

from openerp.osv import fields, osv
from quant import Quant
import time
import logging

_logger = logging.getLogger(__name__)


class QtAlgorithmXueQiu(osv.osv):
    """
    雪球追买策略
    """

    _name = "qt.algorithm.xueqiu"
    _qt_key = "qt_algorithm_xueqiu"


    def log(function):
        def wrapper(cr, uid, mail=[], context=None):
            print 'before function [%s()] run.' % function.__name__
            rst = function(cr, uid, mail=[], context=None)
            print 'after function [%s()] run.' % function.__name__
            return rst
        return wrapper

    @log
    def handle_data(self, cr, uid, mail=[], context=None):
        qt = Quant(cr, uid, self, context)
        section = qt.balance_section(cr, uid, context)
        if section != None:
            _logger.debug(u"----->%s 开始操作->%s" % (qt.algorithm.name, section.name))
            _logger.debug("------>uid:" + str(uid))

