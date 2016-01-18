# -*- coding: utf-8 -*-

from datetime import datetime


# 2016年周一到周五中的非交易日（休市）
CLOSE_DATE = ['2016-01-01', '2016-02-08', '2016-02-09', '2016-02-10',
              '2016-02-11', '2016-02-12', '2016-04-04', '2016-05-02',
              '2016-06-09', '2016-06-10', '2016-09-15', '2016-09-16',
              '2016-10-03', '2016-10-04', '2016-10-05', '2016-10-06',
              '2016-10-07']


def is_trading_date(date_time):
    """判断是否交易日"""
    if isinstance(date_time, datetime):
        weekday = date_time.isoweekday()
        if weekday == 6 or weekday == 7 or str(date_time.date()) in CLOSE_DATE:
            return False
        else:
            return True
    else:
        raise TypeError('Date is not instance of datetime, check the type!')


def is_trading_datetime(date_time):
    """判断是否为交易日交易时间"""
    if is_trading_date(date_time) and _is_trading_time(date_time):
        return True
    else:
        return False


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