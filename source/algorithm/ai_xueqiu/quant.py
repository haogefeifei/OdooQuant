# -*- coding: utf-8 -*-

import logging
import functools
import time
from datetime import datetime

_logger = logging.getLogger(__name__)


class Quant():
    _qt_key = ""

    def __init__(self, obj, cr, uid, context):
        self.obj = obj
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

    # 2016年周一到周五中的非交易日（休市）
    CLOSE_DATE = ['2016-01-01', '2016-02-08', '2016-02-09', '2016-02-10',
                  '2016-02-11', '2016-02-12', '2016-04-04', '2016-05-02',
                  '2016-06-09', '2016-06-10', '2016-09-15', '2016-09-16',
                  '2016-10-03', '2016-10-04', '2016-10-05', '2016-10-06',
                  '2016-10-07']

    @staticmethod
    def is_trading_date(date_time):
        """判断是否交易日"""
        if isinstance(date_time, datetime):
            weekday = date_time.isoweekday()
            if weekday == 6 or weekday == 7 or str(date_time.date()) in Quant.CLOSE_DATE:
                return False
            else:
                return True
        else:
            raise TypeError('Date is not instance of datetime, check the type!')

    @staticmethod
    def is_trading_datetime(date_time):
        """判断是否为交易日交易时间"""
        if Quant.is_trading_date(date_time) and Quant._is_trading_time(date_time):
            return True
        else:
            return False

    @staticmethod
    def _is_trading_time(date_time):
        """判断是否为交易时间，不判断是否为交易日"""
        if isinstance(date_time, datetime):
            if date_time.hour == 9 and date_time.minute > 30:
                return True
            elif date_time.hour == 10 or date_time.hour == 13 or date_time.hour == 14:
                return True
            elif date_time.hour == 11 and date_time.minute < 30:
                return True
            else:
                return False
        else:
            raise TypeError('Time is not instance of datetime, check the type!')

    @staticmethod
    def tick(is_trading_date=False):
        def decorator(function):
            @functools.wraps(function)
            def wrapper(*args, **kwargs):
                if is_trading_date and not Quant.is_trading_date(datetime.now()):
                    return
                start = time.clock()
                _logger.debug(u'>>>>>>>>>>>> tick run <%s> start' % function.__name__)
                rst = function(*args, **kwargs)
                _logger.debug(u'>>>>>>>>>>>> tick run <%s> stop >耗时:%s' % (
                    function.__name__, str("%.2f" % (time.clock() - start))))
                return rst

            return wrapper

        return decorator

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

    def get_setting(self, cr, uid, context=None):
        """
        获取策略设置
        :param cr:
        :param uid:
        :param context:
        :return:
        """
        cr.commit()
        setting_cr = self.obj.pool.get("qt.algorithm.setting")
        ids = setting_cr.search(cr, uid, [('algorithm_id', '=', self.algorithm.id)], context=context)
        if ids:
            setting_list = setting_cr.read(cr, uid, ids, ['key', 'value'], context=context)
            setting_dic = {}
            print '----------->setting_list:', len(setting_list)
            map(lambda x: setting_dic.setdefault(x['key'], x['value']), setting_list)
            print '----------->setting_dic:', setting_dic
            return
        else:
            return {}
