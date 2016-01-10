# -*- coding: utf-8 -*-

import easytrader
import json

def singleton(cls, *args, **kw):
    instances = {}
    def _singleton():
        if cls not in instances:
            instances[cls] = cls(*args, **kw)
        return instances[cls]
    return _singleton

def out(data):
    jsonStr = json.dumps(data, ensure_ascii=False, indent=1)
    print jsonStr

@singleton
class Trader(object):
    trader = easytrader.use('yjb')
    trader.prepare('/Users/aaa/Documents/备份/yjb.json')

    def __init__(self):
        pass