var CONFIG;

$(window).on('load', function () {
    
});

$(document).ready(function(){
    $('.left-m-list-w').outerHeight($('.left-m').innerHeight() - $('.left-m h3').outerHeight() - $('.left-m-btn').outerHeight() - 160);

    getSettings(function () {
        document.title = CONFIG.ClientPageTitle;

        refreshReports(false, function () {
            loadPage();
        });
    });

    $(document).on('click', '.left-m-list li', function (e) {
        if ($(this).hasClass('selected'))
            return false;

        var report = JSON.parse($(this).attr('data-report'));

        $('.left-m-list li').removeClass('selected');
        $(this).addClass('selected');
        $('.report-nf').hide();

        if (typeof(report) !== 'undefined') {
            var temp = report.Query.replace('SELECT', 'select').replace('FROM', 'from');
            var temp1 = temp.match(/select (.*?) from/i);
            var temp2 = temp1[1].trim().split(',');

            $('.report-filter-list').html('');

            $(temp2).each(function (i, field) {
                var colName = field;
                var label = '';

                if (field.toLowerCase().indexOf(' as ') != -1) {
                    var tmp = field;
                    var tmp2 = tmp.split(/ as /i);
                    colName = tmp2[0];
                    label = tmp2[1];
                }

                $('.report-filter-list').append('\
                                                <li data-field="' + field + '" data-col-name="' + colName + '">\
                                                    <span data-label="' + label + '" data-col-name="' + colName + '">' + (label.length > 0 ? label : colName) + '</span>\
                                                    <select class="operand-select">\
                                                        <option value="=">eşittir</option>\
                                                        <option value="!=">eşit değildir</option>\
                                                        <option value=">">büyüktür</option>\
                                                        <option value="<">küçüktür</option>\
                                                        <option value=">=">büyük veya eşittir</option>\
                                                        <option value="<=">küçük veya eşittir</option>\
                                                        <option value="like">benzer (like)</option>\
                                                        <option value="between">arasında</option>\
                                                    </select>\
                                                    <input type="text" class="val1 default-input" />\
                                                    <input type="text" class="val2 default-input" style="margin-top:3px; display:none;" />\
                                                </li >\
                                                ');
            });

            if (report.FiltersJson.length > 0) {
                var filters = JSON.parse(report.FiltersJson);

                $(filters).each(function (i, filter) {
                    $('.report-filter-list li[data-col-name="' + filter.key + '"]').find('input.val1').val(filter.values[0].replace(/'/g, ''));
                    $('.report-filter-list li[data-col-name="' + filter.key + '"]').find('input.val2').val(filter.values[1].replace(/'/g, ''));
                    $('.report-filter-list li[data-col-name="' + filter.key + '"]').find('select').val(filter.operand);

                    if (filter.operand == 'between')
                        $('.report-filter-list li[data-col-name="' + filter.key + '"]').find('input.val2').show();
                    else
                        $('.report-filter-list li[data-col-name="' + filter.key + '"]').find('input.val2').hide();
                });
            }

            refreshPreview();
        }
        
        $('.report-body-w').fadeIn(300);
    });

    $(document).on('click', '.preview-report-btn', function () {
        refreshPreview();
    });

    $(document).on('click', '.refresh-reports-btn', function () {
        refreshReports(true);
    });

    $(document).on('change', '.operand-select', function () {
        var $this = $(this);
        var value = $this.val();

        if (value == 'between') {
            $this.parents('li:first').find('input.val2').show();
        }
        else
            $this.parents('li:first').find('input.val2').hide();
    });

    $(document).on('click', '.left-m-connection-name', function () {
        var $this = $(this);
        var $list = $this.parents('.left-m-connection:first').find('.left-m-list');

        if ($list.css('display') == 'none') {
            $this.parents('.left-m-connection:first').find('i.left-arrow').fadeOut(200);
            $this.parents('.left-m-connection:first').find('i.down-arrow').fadeIn(200);
            $('.left-m-list').slideUp(200);
            $list.slideDown(200);
        }
        else if ($list.css('display') == 'block') {
            $this.parents('.left-m-connection:first').find('i.left-arrow').fadeIn(200);
            $this.parents('.left-m-connection:first').find('i.down-arrow').fadeOut(200);
            $('.left-m-list').slideUp(200);
        }
    });
});

function refreshPreview() {
    var report = JSON.parse($('.left-m-list li.selected').attr('data-report'));
    var sqlQuery = report.Query;

    var filters = [];

    $('.report-filter-list li').each(function () {
        var $this = $(this);

        if ($this.find('input').val().length == 0)
            return true;

        filters.push({
            key: $this.find('span').attr('data-col-name'),
            label: $this.find('span').attr('data-label'),
            operand: $this.find('select').val(),
            values: [
                (!isNaN($this.find('input.val1').val()) || $this.find('input.val1').val().indexOf('()') != -1) ? $this.find('input.val1').val() : ("'" + $this.find('input.val1').val() + "'"),
                (!isNaN($this.find('input.val2').val()) || $this.find('input.val2').val().indexOf('()') != -1) ? $this.find('input.val2').val() : ("'" + $this.find('input.val2').val() + "'"),
            ]
        });
    });

    if (filters.length > 0) {
        var temp = jQuery.map(filters, function (item, i) {
            if (item.operand == 'between')
                return (item.key + ' ' + item.operand + ' ' + item.values[0] + ' AND ' + item.values[1]);

            return (item.key + ' ' + item.operand + ' ' + item.values[0]);
        });

        if (sqlQuery.toLowerCase().indexOf('where') != -1) {
            sqlQuery += ' AND ' + temp.join(' AND ');
        }
        else sqlQuery += ' WHERE ' + temp.join(' AND ');
    }

    $('#report-w').hide();
    GlobalLoading.show();

    Network.ajaxRequest({
        url: '/ReportTool.axd',
        data: 'action=preview&cStr=' + report.ConnectionString + '&query=' + sqlQuery + '&dbType=' + report.DatabaseType + '&id=' + report.Id,
        dataType: 'html',
        success: function (data) {
            GlobalLoading.hide();

            $('#report-w').html(data).fadeIn(300);
        }
    });
}

function getSettings(callback) {
    Network.ajaxRequest({
        type: 'GET',
        url: '/ReportTool.axd',
        data: 'action=config',
        success: function (data) {
            CONFIG = data;

            if (typeof (callback) !== undefined)
                callback();
        }
    });
}

function refreshReports(showGlobalLoading, callback) {
    $('.left-m-list-w').html('');
    $('.report-body-w').hide();
    $('.report-nf').hide();

    if (showGlobalLoading)
        GlobalLoading.show();

    Network.ajaxRequest({
        type: 'GET',
        url: '/ReportTool.axd',
        data: 'action=reports',
        success: function (data) {
            GlobalLoading.hide();

            if (data.ResultCode == 200 && data.Reports.length > 0) {
                $(data.Reports).each(function (i, report) {
                    if ($('div.left-m-connection[data-name="' + report.ConnectionName + '"]').length == 0) {
                        $('.left-m-list-w').append('<div class="left-m-connection" data-name="' + report.ConnectionName + '">\
                                                        <div class="left-m-connection-name">' + report.ConnectionName + '</div>\
                                                        <ul class="left-m-list"></ul>\
                                                        <i class="material-icons left-arrow">keyboard_arrow_left</i>\
                                                        <i class="material-icons down-arrow" style="display:none;">keyboard_arrow_down</i>\
                                                    </div > ');
                    }

                    $('div.left-m-connection[data-name="' + report.ConnectionName + '"]').find('.left-m-list').append('<li data-id="' + report.Id + '">\
                                                <i class="material-icons">content_copy</i> <span>' + report.Name + '</span>\
                                            </li>');
                    $('div.left-m-connection[data-name="' + report.ConnectionName + '"]').find('.left-m-list li:last').attr('data-report', JSON.stringify(report));
                });
            }
            else {
                $('.report-body-w').hide();
                $('.report-nf').show();
            }

            if (typeof (callback) !== 'undefined')
                callback();
        }
    });
}

//function refreshReports(showGlobalLoading, callback) {
//    $('.left-m-list').html('');
//    $('.report-body-w').hide();
//    $('.report-nf').hide();

//    if (showGlobalLoading)
//        GlobalLoading.show();

//    Network.ajaxRequest({
//        type: 'GET',
//        url: '/ReportTool.axd',
//        data: 'action=reports',
//        success: function (data) {
//            GlobalLoading.hide();

//            if (data.ResultCode == 200 && data.Reports.length > 0) {
//                $(data.Reports).each(function (i, report) {
//                    $('.left-m-list').append('<li data-id="' + report.Id + '">\
//                                                <i class="material-icons">content_copy</i> <span>' + report.Name + '</span>\
//                                            </li>');
//                    $('.left-m-list li:last').attr('data-report', JSON.stringify(report));
//                });
//            }
//            else {
//                $('.report-body-w').hide();
//                $('.report-nf').show();
//            }

//            if (typeof (callback) !== 'undefined')
//                callback();
//        }
//    });
//}

function loadPage() {
    setTimeout(function () {
        $('#loader').addClass('loaded');
    }, 2000);

    setTimeout(function () {
        $('body, .logo-w, .left-m, #page, .page-c').addClass('loaded');

        $('head').append('<style>\
            .header-w, .logo-w.loaded {background: ' + CONFIG.ClientSiteColor + ' !important;}\
            .left-m-list li:hover, .left-m-list li.selected {color: ' + CONFIG.ClientSiteColor + ' !important;}\
            button.preview-report-btn {background-color: ' + CONFIG.ClientSiteColor + ' !important;}\
            .left-m-connection-name, .left-m-connection > i {color: ' + CONFIG.ClientSiteColor + ' !important;}\
            #og-loader {border-top-color: ' + CONFIG.ClientSiteColor + ' !important;}\
            #og-loader:before {border-top-color: ' + CONFIG.ClientSiteColor + ' !important;}\
            #og-loader:after {border-top-color: ' + CONFIG.ClientSiteColor + ' !important;}\
        </style>');

        $('#loader').hide();
    }, 2300);

    setTimeout(function () {
        $('.refresh-reports-btn').addClass('loaded');
        $('.logo-w, .logo-w i').css('position', 'absolute');
    }, 3600);
}