{
    'name': 'Mobile Barcode Scanner',
    'version': '1.0',
    'category': 'Tools',
    'summary': 'Scan barcodes and QR codes from phone camera on any page',
    'depends': ['web'],
    'author': 'Servertronix',      # ← ваше имя или название компании
    'data': [],
    'qweb': [],
    'assets': {
        'web.assets_backend': [
            'mobile_barcode_scanner/static/src/css/barcode_scanner.css',
            'https://unpkg.com/html5-qrcode@2.3.8/html5-qrcode.min.js',
            'mobile_barcode_scanner/static/src/js/barcode_scanner.js',
        ],
    },
    'images': ['static/description/02.jpg'],
    'icon': '/static/description/icon.png',
    'license': 'LGPL-3',
    'support': 'yogannnn@gmail.com',
    'installable': True,
    'application': True,
}
