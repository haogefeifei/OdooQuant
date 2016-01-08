# -*- coding: utf-8 -*-

from openerp.osv import fields, osv
from logbook import Logger, StreamHandler
import logbook
import tushare as ts
import sys
import os

logbook.set_datetime_format('local')
StreamHandler(sys.stdout).push_application()
log = Logger(os.path.basename(__file__))


class StockBasics(osv.osv):
    """
    沪深上市公司股票
    """

    _name = "stock.basics"
    _columns = {
        'name': fields.char(u"名称", required=True),
        'code': fields.char(u"代码", required=True),
        'industry': fields.char(u"所属行业"),
        'area': fields.char(u"地区"),
        'pe': fields.float(u"市盈率"),
        'pb': fields.float(u"市净率"),
        'outstanding': fields.float(u"流通股本"),
        'totals': fields.float(u"总股本(万)"),
        'total_assets': fields.float(u"总资产(万)"),
        'liquid_assets': fields.float(u"流动资产"),
        'fixed_assets': fields.float(u"固定资产"),
        'reserved': fields.float(u"公积金"),
        'reserved_per_share': fields.float(u"每股公积金"),
        'eps': fields.float(u"每股收益"),
        'bvps': fields.float(u"每股净资资产"),
        'time_to_market': fields.date(u"上市日期"),
        'line_ids': fields.one2many('stock.basics.day.line', 'stock_id', u'股票日K数据', help=u'股票日K数据'),
    }

    def run_get_stock_base_data(self, cr, uid, mail=[], context=None):
        """更新数据定时任务
        """

        log.debug("----------->执行定时任务")

        # 更新股票列表 ------------------------------------------------
        stock_basics_list = ts.get_stock_basics()
        log.debug("----------->查询到总共:" + str(stock_basics_list.shape[0]) + "股票")

        basics_obj = self.pool.get('stock.basics')
        ids = basics_obj.search(cr, uid, [])
        res = basics_obj.read(cr, uid, ids, ['name', 'code', 'id'], context)
        res = [(r['name'], r['code'], r['id']) for r in res]

        basics_local_list = []
        for basics in res:
            basics_local_list.append(basics[1])

        i = 0
        while i < stock_basics_list.shape[0]:
            s_data = stock_basics_list[i:i + 1]
            s_code = s_data.index.values[0]
            s_name = s_data.name.values[0]
            s_industry = s_data.industry.values[0]
            s_area = s_data.area.values[0]
            s_pe = s_data.pe.values[0]
            s_pb = s_data.pb.values[0]
            s_outstanding = s_data.outstanding.values[0]
            s_totals = s_data.totals.values[0]
            s_total_assets = s_data.totalAssets.values[0]
            s_liquid_assets = s_data.liquidAssets.values[0]
            s_fixed_assets = s_data.fixedAssets.values[0]
            s_reserved = s_data.reserved.values[0]
            s_reserved_per_share = s_data.reservedPerShare.values[0]
            s_eps = s_data.esp.values[0]
            s_bvps = s_data.bvps.values[0]
            s_time_to_market = s_data.timeToMarket.values[0]

            #
            # basics_ids = basics_obj.search(cr, uid, [('code', '=', s_code)])

            i += 1

            if not s_code in basics_local_list:
                # log.debug("----------->该股票不存在,创建~" + str(s_code))
                basics_obj.create(cr, uid, {
                    'name': str(s_name),
                    'code': str(s_code),
                    'industry': str(s_industry),
                    'area': str(s_area),
                    'pe': float(s_pe),
                    'pb': float(s_pb),
                    'outstanding': float(s_outstanding),
                    'totals': float(s_totals),
                    'total_assets': float(s_total_assets),
                    'liquid_assets': float(s_liquid_assets),
                    'fixed_assets': float(s_fixed_assets),
                    'reserved': float(s_reserved),
                    'reserved_per_share': float(s_reserved_per_share),
                    'eps': float(s_eps),
                    'bvps': float(s_bvps),
                    'time_to_market': s_time_to_market,
                }, context=context)
                cr.commit()
            else:
                # log.debug("----------->该股票已经存在,更新数据" + str(s_code))
                write_ids = basics_obj.search(cr, uid, [('code', '=', str(s_code))])
                basics_obj.write(cr, uid, write_ids, {
                    'name': str(s_name),
                    'industry': str(s_industry),
                    'area': str(s_area),
                    'pe': float(s_pe),
                    'pb': float(s_pb),
                    'outstanding': float(s_outstanding),
                    'totals': float(s_totals),
                    'total_assets': float(s_total_assets),
                    'liquid_assets': float(s_liquid_assets),
                    'fixed_assets': float(s_fixed_assets),
                    'reserved': float(s_reserved),
                    'reserved_per_share': float(s_reserved_per_share),
                    'eps': float(s_eps),
                    'bvps': float(s_bvps),
                    'time_to_market': s_time_to_market,
                }, context=context)
                cr.commit()

        # TODO 暂时注释掉更新日K数据
        return

        # 更新日K数据 ------------------------------------------------
        log.debug("----------->更新日K数据")
        basics_obj = self.pool.get('stock.basics')
        ids = basics_obj.search(cr, uid, [])
        res = basics_obj.read(cr, uid, ids, ['name', 'code', 'id'], context)
        res = [(r['name'], r['code'], r['id']) for r in res]

        num = 0
        for stock in res:
            num += 1
            id = stock[2]  # id
            log.debug("----------->进度:(" + str(num) + "/" + str(len(res)) + ")")
            code = stock[1]  # 股票代码

            day_line_obj = self.pool.get('stock.basics.day.line')
            ids = day_line_obj.search(cr, uid, [('stock_id.id', '=', id)])

            if len(ids) > 0:
                log.debug("----------->不是第一次更新数据" + str(id))
                last_day = day_line_obj.read(cr, uid, ids[0], ['date'], context)
                log.debug("----------->最后更新日期:" + str(last_day['date']))
                # TODO 没写完
            else:
                # log.debug("----------->没有日数据" + str(id))
                day_data_list = ts.get_hist_data(code)
                i = 0
                while i < day_data_list.shape[0]:
                    s_data = day_data_list[i:i + 1]
                    s_date = s_data.index.values[0]
                                # 涨跌趋势
                    if s_data.p_change.values[0] > 0:
                        trend = "↑"
                    elif s_data.p_change.values[0] < 0:
                        trend = "↓"
                    else:
                        trend = '-'

                    day_line_obj.create(cr, uid, {
                        'date': s_date,
                        'high': s_data.high.values[0],
                        'close': s_data.close.values[0],
                        'low': s_data.low.values[0],
                        'volume': s_data.volume.values[0],
                        'price_change': s_data.price_change.values[0],
                        'p_change': s_data.p_change.values[0],
                        'p_change_str': str("%.2f"%(s_data.p_change.values[0])) + "%",
                        'ma5': s_data.ma5.values[0],
                        'ma10': s_data.ma10.values[0],
                        'ma20': s_data.ma20.values[0],
                        'v_ma5': s_data.v_ma5.values[0],
                        'v_ma10': s_data.v_ma10.values[0],
                        'v_ma20': s_data.v_ma20.values[0],
                        'turnover': s_data.turnover.values[0],
                        'trend': trend,
                        'stock_id': id,
                    }, context=context)
                    cr.commit()
                    i += 1


class StockBasicsDayLine(osv.osv):
    """
    股票日K数据
    """

    _name = "stock.basics.day.line"
    _order = "date desc"

    _columns = {
        "date": fields.date(u"日期"),
        'high': fields.float(u"最高价"),
        'close': fields.float(u"收盘价"),
        'low': fields.float(u"最低价"),
        'volume': fields.float(u"成交量"),
        'price_change': fields.float(u"价格变动"),
        'p_change': fields.float(u"涨跌幅"),
        'p_change_str': fields.char(u"涨跌幅"),
        'ma5': fields.float(u"5日均价"),
        'ma10': fields.float(u"10日均价"),
        'ma20': fields.float(u"20日均价"),
        'v_ma5': fields.float(u"5日均量"),
        'v_ma10': fields.float(u"10日均量"),
        'v_ma20': fields.float(u"20日均量"),
        'turnover': fields.float(u"换手率"),
        'trend': fields.char(u"涨跌趋势"),
        'stock_id': fields.many2one('stock.basics', u'股票', required=True, ondelete="cascade"),
    }
