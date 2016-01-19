# -*- coding: utf-8 -*-

import urllib2
import json
import time
import os


# thanks for https://github.com/yyglider/snowball

def get_html(url):
    send_headers = {
        'User-Agent':'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/43.0.2357.81 Safari/537.36',
        'Accept':'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Connection':'keep-alive',
        'Host':'xueqiu.com',
        'Cookie':r'xxxxxx',
    }
    req = urllib2.Request(url, headers=send_headers)
    resp = urllib2.urlopen(req)
    html = resp.read()
    return html


def get_portfolio(mainUrl,code):
    url = mainUrl + code
    html = get_html(url)

    pos_start = html.find('SNB.cubeInfo = ') + 15
    pos_end = html.find('SNB.cubePieData')
    data = html[pos_start:pos_end]
    dic = json.loads(data)
    return dic

def get_time(data):
    x = time.localtime(data/1000)
    return time.strftime('%Y-%m-%d %H:%M:%S',x)

