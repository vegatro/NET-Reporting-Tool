define('config-data', function () {
    'use strict';

    /* jshint ignore:start */
    return {
        'saveReport': '/FastReport.Export.axd?putReport=#{id}',
        'makePreview': '/FastReport.Export.axd?makePreview=#{id}',
        'getReport': '/FastReport.Export.axd?getReport=#{id}&v=#{rand_hash}',
        'getFunctions': '/FastReport.Export.axd?getFunctions=#{id}',
        'cookieName': 'ARRAffinity',

        'locales-path':'locales/#{locale}.js',
        'templates-path': 'views/#{name}.tmpl.html',
        'images-path':'images/#{image}',

        'scale-mobile': 0.6,
        'scale': 1,

        'grid': 9.45, // 9.45 px === 0.25 cm

        'sticky-grid': true,

        'hotkeyProhibited': false,

        'dasharrays': {
            'DashDot': '9, 2, 2, 2',
            'Dot': '2, 2',
            'Solid': '',
            'Dash': '9, 3',
            'DashDotDot': '9, 2, 2, 2, 2, 2'
        },

        'font-names': [
            'Calibri', 'Calibri Light', 'Comic Sans MS', 'Consolas', 'Constantia', 'Courier New',
            'Georgia', 'Impact',
            'Tahoma', 'Times New Roman',
            'Trebuchet MS', 'Verdana',
            'Droid Sans Mono', 'Ubuntu Mono',
            /* WebFont which could not be loaded are listed below */
            'Microsoft Sans Serif', 'Palatino Linotype', 'Lucida Console', 'Lucida Sans Unicode', 'Segoe Print', 'Segoe Script', 'Segoe UI', 'Segoe UI Symbol', 'Sylfaen', 'Symbol', 'Webdings', 'Wingbings', 'Cambria', 'Arial', 'Candara', 'Corbel', 'Franklin Gothic', 'Gabriola', 'Cambria Math'
        ],
        'default-font-name': 'Arial',

        'brackets': '[,]',

        'band-indent-top': 9.448,
        'band-indent-opacity': 0.3,

        'minComponentWidthForResizingElements': 40,
        'minComponentHeightForResizingElements': 40,

        'rectButtonWidth': 15,
        'rectButtonHeight': 15,
        'rectButtonOpacity': 0.6,
        'rectButtonFill': 'rgb(183, 36, 29)',

        'circleButtonWidth': 6,
        'circleButtonHeight': 6,
        'circleButtonRadius': 5,
        'circleButtonWidth-mobile': 12,
        'circleButtonHeight-mobile': 12,
        'circleButtonRadius-mobile': 10,
        'circleButtonFill': 'rgb(183, 36, 29)',
        'circleButtonOpacity': 0.6,

        'resizingBandBlockWidth': 100,
        'resizingBandBlockHeight': 15,

        'polylineStroke': 'rgb(183, 36, 29)',
        'polylineStrokeWidth': '1px',
        'selectedPolylineStrokeWidth': '2.5px',
        'polylineFill': 'none',
        'polylineWidth': 4,

        'lineMovingScope': 30,

        'guides': true,

        'default-band-separator-color': '#C0C0C0',
        'selected-band-separator-color': '#2B579A',

        'show-band-title': true,
        'add-bands': true,
        'resize-bands': true,
        'movable-components': true,
        'resizable-components': true,

        'customization': {
            'properties': {
                'enable': true,
                'button': true,
                'shown': false,
                'header': true,
                'hasBorder': true,
                'movable': true,
                'resizable': true,
                // 'background': 'initial', // css rule
            },
            'events': {
                'enable': true,
                'button': true,
                'shown': false,
                'header': true,
                'hasBorder': true,
                'movable': true,
                'resizable': true,
                // 'background': 'initial',
            },
            'report-tree': {
                'enable': true,
                'button': true,
                'shown': false,
                'header': true,
                'hasBorder': true,
                'movable': true,
                'resizable': true,
                // 'background': 'initial',
            },
            'data': {
                'enable': true,
                'button': true,
                'shown': false,
                'header': true,
                'hasBorder': true,
                'movable': true,
                'resizable': true,
                // 'background': 'initial',
            },
        },

        'fadeout': 150,

        // home, view, components, bands, page
        // for classic theme
        'default-tab-menu': 'home',

        // default, small, large
        'show-saving-progress': 'default',

        // default, html5, false,
        'notifications': 'default',
        'notifications-mobile': 'default',

        
    };
    /* jshint ignore:end */
});
