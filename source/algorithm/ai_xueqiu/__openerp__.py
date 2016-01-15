# -*- coding: utf-8 -*-

{
    'name': "雪球追买策略",
    'sequence': 1,
    'summary': """
        雪球追买策略""",

    'description': """
        追着雪球组合买..
    """,

    'author': "haogefeifei",
    'website': "http://haogefeifei.com",

    # Categories can be used to filter modules in modules listing
    # Check https://github.com/odoo/odoo/blob/master/openerp/addons/base/module/module_data.xml
    # for the full list
    'category': '工具',
    'version': '1.0',

    # any module necessary for this one to work correctly
    'depends': ['base', 'stock_robot'],

    # always loaded
    'data': [
        # 'security/ir.model.access.csv',
        # 'templates.xml',
        # 'view/view_stock_basics.xml',
        # 'report/stock_day_line_report_view.xml',
        'data/task.xml',
        'data/data.xml',
        # 'menu/menu.xml',
    ],
    'application': True,
}
