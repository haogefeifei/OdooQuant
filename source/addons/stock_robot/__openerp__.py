# -*- coding: utf-8 -*-
{
    'name': "股票机器人",
    'sequence': 1,
    'summary': """
        股票分析/自动交易""",

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
    'depends': ['base', 'stock_data'],

    # always loaded
    'data': [
        # 'security/ir.model.access.csv',
        # 'templates.xml',
        'view/view_stock_position.xml',
        'view/view_stock_profit_history.xml',
        'view/view_stock_balance.xml',
        'view/view_stock_entrust.xml',
        'view/view_qt_balance_section.xml',
        'menu/menu.xml',
    ],
    'application': True,
}
