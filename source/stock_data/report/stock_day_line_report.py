# -*- coding: utf-8 -*-

from openerp.osv import fields, osv
from openerp import tools

class StockDayLineReport(osv.osv):

    """股票日走势图表
    """

    _name = "stock.day.line.report"
    _description = u"股票日走势图表"
    _auto = False

    _columns = {

        'close': fields.float(u'价格', readonly=True),
        'date': fields.char(u'时间', readonly=True),
        'stock_id': fields.many2one('stock.basics', u'股票'),
    }

    # TODO 毛病还好多........
    def init(self, cr):

        """
            初始化
        """
        tools.drop_view_if_exists(cr, 'stock_day_line_report')
        cr.execute("""
            create or replace view stock_day_line_report as (
                select
                    min(q.id) as id,
                    q.close as close,
                    to_char(q.date, 'YYYY-mm-dd') as date,
                    q.stock_id as stock_id
                from
                    stock_basics_day_line q
                where q.date > '2015-10-05'
                group by
                    q.close,
                    q.date,
                    q.stock_id
            )""")