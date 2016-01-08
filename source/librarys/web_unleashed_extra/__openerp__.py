# -*- coding: utf-8 -*-
{
    'name': 'Web Unleashed - Extra',
    'version': '1.0',
    'category': 'Hidden',
    
    'description': """
Extra components for unleashed module:

- Twitter bootstrap 3.0, prefixed with a `bootstrap-scoped` css class: http://getbootstrap.com/
- jQuery Transit (css3 animation): http://ricostacruz.com/jquery.transit/
- NumeralJs lib: https://numeraljs.com/
- MomentJs lib: http://momentjs.com/
- Font Awesome lib: http://fortawesome.github.io/Font-Awesome/
- Additional base models: period
    """,
    
    'author': 'Trobz',
    'website': 'http://trobz.com',
    
    'depends': [
        'web_unleashed'
    ],

    'data': [
        # JS/CSS Assets files
        'views/web_unleashed_extra.xml',
    ],

    'qweb': [
        'static/src/templates/*.xml',
    ],
    
    'test': [
    ]
}
