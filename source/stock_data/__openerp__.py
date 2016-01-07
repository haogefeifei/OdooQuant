# -*- coding: utf-8 -*-

{
    'name': "股票数据",
    'sequence': 1,
    'summary': """
        股票采集/保存/查看""",

    'description': """
        介绍省略
    """,

    'author': "haogefeifei",
    'website': "http://haogefeifei.com",

    # Categories can be used to filter modules in modules listing
    # Check https://github.com/odoo/odoo/blob/master/openerp/addons/base/module/module_data.xml
    # for the full list
    'category': '工具',
    'version': '1.0',

    # any module necessary for this one to work correctly
    'depends': ['base'],

    # always loaded
    'data': [
        # 'security/ir.model.access.csv',
        # 'templates.xml',
        'view/view_stock_basics.xml',
        # 'report/stock_day_line_report_view.xml',
        'data/data_task.xml',
        'menu/menu.xml',
    ],
    'application': True,
}
