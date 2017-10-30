var CONFIG;

$(window).on('load', function () {
    
});

$(document).ready(function(){
    $('.left-m-list-w').outerHeight($('.left-m').innerHeight() - $('.left-m h3').outerHeight() - $('.left-m-btn').outerHeight() - 160);

    getSettings(function () {
        document.title = CONFIG.AdminPageTitle;

        refreshReports(false, function () {
            loadPage();
        });
    });

    $(document).on('click', '.new-report-btn', function () {
        if ($('.left-m-list li.unsaved').length) {
            Toast.show({ content: 'Lütfen önce yeni oluşturduğunuz raporu kaydedin', type: TOAST_TYPE.ERROR });
            return;
        }

        //$('.left-m-list').prepend('<li class="unsaved"><i class="material-icons">content_copy</i> <span>Yeni Rapor</span><button class="delete-report-btn">Sil</button></li>');

        $('.left-m-list').prepend('<li class="unsaved">\
                                                <i class="material-icons">show_chart</i> <span>Yeni Rapor</span>\
                                                <button class="delete-report-btn" title="Raporu Sil"><i class="material-icons">close</i></button>\
                                            </li>');

        $('.left-m-list li:first').attr('data-report', JSON.stringify({
            'Name': '',
            'ConnectionName': '',
            'ConnectionString': '',
            'Query': '',
            'DatabaseType': 'none',
            'FiltersJson': '',
            'SendEmail': false,
            'EmailPeriod': 'none',
            'EmailStartDate': '',
            'EmailStartDateStr': '0001.01.01 00:00:00',
            'EmailTo': '',
            'EmailCC': '',
            'IsPublic': true,
            'UsersJson': ''
        })).trigger('click');
    });

    $(document).on('click', '.left-m-list li', function (e) {
        if ($(e.target).is('.delete-report-btn') || $(e.target).parents('.delete-report-btn').length
            || $(e.target).is('.copy-report-btn') || $(e.target).parents('.copy-report-btn').length)
            return false;

        if ($(this).hasClass('selected'))
            return false;

        var report = JSON.parse($(this).attr('data-report'));

        $('.left-m-list li').removeClass('selected');
        $(this).addClass('selected');
        $('.report-nf').hide();

        $('.choose-con-str-text').text('Bağlantı Seçin *');

        if (typeof(report) !== 'undefined') {
            $('#r-name-in').val(report.Name);
            $('#r-con-str-in').val(report.ConnectionString);
            $('#r-con-name-in').val(report.ConnectionName);
            $('#r-db-type-select').val(report.DatabaseType);
            $('#r-sql-q-in').val(report.Query);
            $('.report-filter-list').attr('data-filters', report.FiltersJson);
            $('#send-email-cb').prop('checked', report.SendEmail);
            $('#email-period').val(report.EmailPeriod);
            $('#email-to').val(report.EmailTo);
            $('#email-cc').val(report.EmailCC);

            if (report.EmailStartDateStr.indexOf('0001') == -1)
                $('#email-start-date').val(report.EmailStartDateStr);

            if (report.ConnectionString.length > 0) {
                var html = '';

                if (report.ConnectionName.length > 0)
                    html += '<strong>' + report.ConnectionName + '</strong> - ';

                if (report.DatabaseType.length > 0)
                    html += '<strong>' + report.DatabaseType + '</strong> - ';

                html += report.ConnectionString;

                $('.choose-con-str-text').html(html);
            }
        }

        jQuery.datetimepicker.setLocale('tr');
        $('#email-start-date').datetimepicker({
            format: 'd.m.Y H:i',
            formatTime: 'H:i',
            formatDate: 'd/m/Y',
            defaultDate: '+03.01.1970',
            defaultTime: '10:00',
            onShow: function () {
                //$('body').one('click', function (event) {
                //    if (!$(event.target).is('.xdsoft_datetimepicker') && $(event.target).parents('.xdsoft_datetimepicker').length == 0) {
                //        $('#email-start-date').datetimepicker('hide');
                //    }
                //});
            }
        });

        $('.choose-con-str-list').html('');

        $('.left-m-list li').each(function (i) {
            if ($(this).hasClass('unsaved'))
                return true;

            var report = JSON.parse($(this).attr('data-report'));

            if ($('.choose-con-str-list li[data-db-type="' + report.DatabaseType + '"][data-con-str="' + report.ConnectionString + '"][data-con-name="' + report.ConnectionName + '"]').length)
                return true;

            $('.choose-con-str-list').append('<li data-db-type="' + report.DatabaseType + '" data-con-str="' + report.ConnectionString + '" data-con-name="' + report.ConnectionName + '"><strong>' + report.ConnectionName + '</strong> - <strong>' + report.DatabaseType + '</strong> - <span class="con-str">' + report.ConnectionString + '</span></li>');
        });

        $('.choose-con-str-list').prepend('<li class="new-con-str" data-db-type="" data-con-name=""><span class="con-str">Yeni Bağlantı Oluştur</span></li>');

        $('.progressbar li').removeClass('active');
        $('.progressbar li:first').addClass('active');
        $('.step-btn, .report-builder-step').hide();
        $('.step-btn[data-type="next"]').show();
        $('.report-builder-w, .report-builder-step[data-step="1"]').fadeIn(300);
    });

    $(document).on('click', '.choose-con-str-text', function () {
        var $this = $(this);
        var isVisible = ($this.attr('data-visible') === 'true');

        if (isVisible) {
            $('.choose-con-str-list').hide();
            $this.attr('data-visible', 'false');
        }
        else {
            $('.choose-con-str-list').show();
            $this.attr('data-visible', 'true');
        }
    });

    $(document).on('click', '.choose-con-str-list li', function () {
        var $this = $(this);
        var conStr = $this.find('.con-str').text();
        var conName = $this.attr('data-con-name');
        var dbType = $this.attr('data-db-type');
        var isNew = $this.hasClass('new-con-str');

        if (isNew) {
            $('#r-con-name-in').val('').show();
            $('#r-con-str-in').val('').show();
            $('#r-db-type-select').val('none').show();
        }
        else {
            $('#r-con-name-in').val(conName);
            $('#r-con-str-in').val(conStr);
            $('#r-db-type-select').val(dbType);
        }

        var html = '';

        if (conName.length > 0)
            html += '<strong>' + conName + '</strong> - ';

        if (dbType.length > 0)
            html += '<strong>' + dbType + '</strong> - ';

        html += conStr;

        $('.choose-con-str-text').html(html);
        $('.choose-con-str-text').attr('data-visible', 'false');
        $('.choose-con-str-list').hide();
    });

    $(document).on('click', '.copy-report-btn', function () {
        var $this = $(this);

        GlobalLoading.show();

        Network.ajaxRequest({
            type: 'POST',
            url: '/ReportTool.axd',
            data: 'action=copy&id=' + $this.parents('li:first').attr('data-id'),
            success: function (data) {
                GlobalLoading.hide();

                if (data.ResultCode == 200) {
                    refreshReports(true, function () {
                        Toast.show({ content: 'Rapor kopyalandı', type: TOAST_TYPE.SUCCESS });
                    });
                }
                else
                    Toast.show({ content: 'Rapor kopyalanamadı, lütfen tekrar deneyin', type: TOAST_TYPE.ERROR });
            }
        });
    });

    $(document).on('click', '.delete-report-btn', function () {
        var $this = $(this);
        var unsaved = $this.parents('li:first').hasClass('unsaved');
        var reportName = $this.parents('li:first').find('span').text();

        var confirm = window.confirm(reportName + ' isimli raporu silmek istediğinize emin misiniz?');

        if (!confirm)
            return false;

        if (unsaved) {
            $this.parents('li:first').remove();
            $('.report-builder-w').hide();
            $('.left-m-list li').removeClass('selected');

            if ($('.left-m-list li').length == 0) {
                $('.report-nf').show();
            }
        }
        else {
            Network.ajaxRequest({
                type: 'POST',
                url: '/ReportTool.axd',
                data: 'action=delete&id=' + $this.parents('li:first').attr('data-id'),
                success: function (data) {
                    if (data.ResultCode == 200) {
                        refreshReports(true, function () {
                            Toast.show({ content: 'Rapor silindi', type: TOAST_TYPE.SUCCESS });
                        });
                    }
                    else
                        Toast.show({ content: 'Rapor silinemedi, lütfen tekrar deneyin', type: TOAST_TYPE.ERROR });
                }
            });
        }
    });

    $(document).on('change', '#send-email-cb', function () {
        var isChecked = $(this).is(':checked');

        if (isChecked)
            $('.email-dep').show();
        else
            $('.email-dep').hide();
    });

    $(document).on('click', '.step-btn:not(.step-btn[data-type="complete"])', function () {
        var btnType = $(this).attr('data-type');
        var currentStep = parseInt($('.progressbar li.active').attr('data-step'));
        var nextStep = 1;
        var reportName = $('#r-name-in').val();
        var connectionString = $('#r-con-str-in').val();
        var connectionName = $('#r-con-name-in').val();
        var dbType = $('#r-db-type-select').val();
        var sqlQuery = $('#r-sql-q-in').val();
        var id = -1;

        if (typeof($('.left-m-list li.selected').attr('data-id')) !== 'undefined')
            id = parseInt($('.left-m-list li.selected').attr('data-id'));

        if (btnType == 'next')
            nextStep = currentStep + 1;
        else
            nextStep = currentStep - 1;

        $('.step-btn').show();

        if (nextStep == 1) {
            $('.step-btn[data-type="prev"]').hide();
            $('.step-btn[data-type="complete"]').hide();
        }
        else if (nextStep == 2) {
            $('.step-btn[data-type="complete"]').hide();

            if (reportName.length == 0 || connectionString.length == 0 || connectionName.length == 0 || sqlQuery.length == 0 || dbType == 'none') {
                $('.step-btn[data-type="prev"]').hide();
                Toast.show({ content: 'Lütfen (*) ile işaretlenen alanları doldurun', type: TOAST_TYPE.ERROR });
                return;
            }

            if (sqlQuery.toLowerCase().indexOf('select') == -1
                || sqlQuery.toLowerCase().indexOf('from') == -1) {
                $('.step-btn[data-type="prev"]').hide();
                Toast.show({ content: 'Lütfen geçerli bir SQL sorgusu girin', type: TOAST_TYPE.ERROR });
                return;
            }

            var temp = sqlQuery.replace('SELECT', 'select').replace('FROM', 'from');
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

            if (typeof ($('.report-filter-list').attr('data-filters')) !== 'undefined' && $('.report-filter-list').attr('data-filters').length > 0) {
                var filters = JSON.parse($('.report-filter-list').attr('data-filters'));

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

        }
        else if (nextStep == 3) {
            $('.step-btn[data-type="complete"]').hide();

            if (currentStep < nextStep) {
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

                $('.report-filter-list').attr('data-filters', JSON.stringify(filters));

                $('.step-btn[data-type="complete"]').hide();

                GlobalLoading.show();

                Network.ajaxRequest({
                    url: '/ReportTool.axd',
                    data: 'action=designer&cStr=' + connectionString + '&query=' + sqlQuery + '&dbType=' + dbType + '&id=' + id,
                    dataType: 'html',
                    success: function (data) {
                        GlobalLoading.hide();

                        $('.report-builder-step[data-step="3"]').html('<div>' + data + '</div>');
                        $('.progressbar li').removeClass('active');
                        $('.progressbar li[data-step="' + nextStep + '"]').addClass('active');
                        $('.report-builder-step').hide();
                        $('.report-builder-step[data-step="' + nextStep + '"]').fadeIn(300);
                        //$('.step-btn[data-type="next"]').hide();
                        //$('.step-btn[data-type="complete"]').show();
                    },
                    error: function () {
                        GlobalLoading.hide();

                        Toast.show({ content: 'Lütfen girdiğiniz bağlantı ve sorguyu kontrol edip tekrar deneyin. Veritabanı bağlantısı kurulamadı.', type: TOAST_TYPE.ERROR });
                    }
                });

                return;
            }
        }
        else if (nextStep == 4) {
            $('.step-btn[data-type="complete"]').hide();

            if ($('#send-email-cb').is(':checked')) {
                $('.email-dep').show();
            }

            if (currentStep < nextStep) {
                GlobalLoading.show();

                Network.ajaxRequest({
                    url: '/ReportTool.axd',
                    data: 'action=checkDesignerSaved',
                    success: function (data) {
                        GlobalLoading.hide();

                        if (data.ResultCode == 200) {
                            $('.step-btn[data-type="next"]').show();

                            if ($('#send-email-cb').is(':checked')) {
                                $('.email-dep').show();
                            }

                            $('.progressbar li').removeClass('active');
                            $('.progressbar li[data-step="' + nextStep + '"]').addClass('active');
                            $('.report-builder-step').hide();
                            $('.report-builder-step[data-step="' + nextStep + '"]').fadeIn(300);
                        }
                        else {
                            Toast.show({
                                content: 'Lütfen önce tasarladığınız raporu "Rapor -> Kaydet" menüsünden kaydedin.', type: TOAST_TYPE.ERROR
                            });
                        }
                    }
                });

                return;
            }
        }
        else if (nextStep == 5) {
            $('.step-btn[data-type="next"]').hide();
            $('.step-btn[data-type="complete"]').hide();

            if ($('#send-email-cb').is(':checked')) {
                var emailPeriod = $('#email-period').val();
                var emailStartDate = $('#email-start-date').val();
                var emailTo = $('#email-to').val();

                if (emailPeriod == 'none' || emailStartDate.length == 0 || emailTo.length == 0) {
                    Toast.show({ content: 'Lütfen yıldızlı alanları doldurun', type: TOAST_TYPE.ERROR });
                    $('.step-btn[data-type="next"]').show();
                    return;
                }
            }

            GlobalLoading.show();

            Network.ajaxRequest({
                url: CONFIG.UserApiUrl,
                success: function (data) {
                    GlobalLoading.hide();

                    $('.user-list').html('');

                    $(data).each(function (i, user) {
                        $('.user-list').append('\
                                            <li>\
                                                <input type= "checkbox" value= "' + user.Id + '" />\
                                                <span class="user-list-id">' + user.Id + '</span>\
                                                <span> - </span>\
                                                <span class="user-list-uname">' + user.Username + '</span>\
                                             </li>\
                                        ');
                    });

                    var report = JSON.parse($('.left-m-list li.selected').attr('data-report'));

                    if (report.IsPublic)
                        $('#report-public-cb').prop('checked', true);
                    else {
                        $('#report-public-cb').prop('checked', false);

                        if (report.UsersJson.length > 0) {
                            var users = JSON.parse(report.UsersJson);

                            $(users).each(function (i, user) {
                                $('.user-list input[value="' + user + '"]').prop('checked', true);
                            });
                        }

                        $('#user-list-w').show();
                    }

                    $('.step-btn[data-type="complete"]').show();

                    $('.progressbar li').removeClass('active');
                    $('.progressbar li[data-step="' + nextStep + '"]').addClass('active');
                    $('.report-builder-step').hide();
                    $('.report-builder-step[data-step="' + nextStep + '"]').fadeIn(300);
                },
                error: function () {
                    GlobalLoading.hide();
                    Toast.show({ content: 'Kullanıcı listesi alınamadı, lütfen UserApiUrl değerinin ve JSON formatının doğru olduğundan emin olun', type: TOAST_TYPE.ERROR });

                    var report = JSON.parse($('.left-m-list li.selected').attr('data-report'));

                    if (report.IsPublic)
                        $('#report-public-cb').prop('checked', true);
                    else {
                        $('#report-public-cb').prop('checked', false);
                    }

                    $('.step-btn[data-type="complete"]').show();

                    $('.progressbar li').removeClass('active');
                    $('.progressbar li[data-step="' + nextStep + '"]').addClass('active');
                    $('.report-builder-step').hide();
                    $('.report-builder-step[data-step="' + nextStep + '"]').fadeIn(300);
                }
            });

            return;
        }

        $('.progressbar li').removeClass('active');
        $('.progressbar li[data-step="' + nextStep + '"]').addClass('active');
        $('.report-builder-step').hide();
        $('.report-builder-step[data-step="' + nextStep + '"]').fadeIn(300);
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

    $(document).on('change', '#report-public-cb', function () {
        var isSelected = $(this).is(':checked');

        if (isSelected)
            $('#user-list-w').slideUp(200);
        else
            $('#user-list-w').slideDown(200);
    });

    $(document).on('click', '.user-list li', function (e) {
        var $this = $(this);

        if ($(e.target).is($this.find('input[type="checkbox"]')))
            return true;

        var isSelected = $this.find('input[type="checkbox"]').is(':checked');

        if (isSelected)
            $this.find('input[type="checkbox"]').prop('checked', false);
        else
            $this.find('input[type="checkbox"]').prop('checked', true);
    });

    $(document).on('click', '.step-btn[data-type="complete"]', function () {
        var reportName = $('#r-name-in').val();
        var connectionName = $('#r-con-name-in').val();
        var connectionString = $('#r-con-str-in').val();
        var sqlQuery = $('#r-sql-q-in').val();
        var dbType = $('#r-db-type-select').val();
        var filtersJson = $('.report-filter-list').attr('data-filters');
        var sendEmail = $('#send-email-cb').is(':checked');
        var emailPeriod = $('#email-period').val();
        var emailStartDate = $('#email-start-date').val();
        var emailTo = $('#email-to').val();
        var emailCC = $('#email-cc').val();
        var isPublic = $('#report-public-cb').is(':checked');
        var users = [];

        if (!isPublic) {
            $('.user-list li').each(function () {
                var $this = $(this);

                if ($this.find('input[type="checkbox"]').is(':checked'))
                    users.push(parseInt($this.find('.user-list-id').text()));
            });
        }

        if (!isPublic && users.length == 0) {
            Toast.show({ content: 'Lütfen en az bir kullanıcı seçin', type: TOAST_TYPE.ERROR });
            return;
        }

        var data = 'action=save&rName=' + reportName
            + '&cStr=' + connectionString
            + '&cName=' + connectionName
            + '&query=' + sqlQuery
            + '&dbType=' + dbType
            + '&filtersJson=' + filtersJson
            + '&sendEmail=' + sendEmail
            + '&emailPeriod=' + emailPeriod
            + '&emailStartDate=' + emailStartDate
            + '&emailTo=' + emailTo
            + '&emailCC=' + emailCC
            + '&isPublic=' + isPublic
            + '&users=' + JSON.stringify(users);

        if (typeof($('.left-m-list li.selected').attr('data-id')) !== 'undefined')
            data += '&id=' + $('.left-m-list li.selected').attr('data-id');

        GlobalLoading.show();

        Network.ajaxRequest({
            type: 'POST',
            url: '/ReportTool.axd',
            data: data,
            success: function (data) {
                GlobalLoading.hide();

                if (data.ResultCode == 200) {
                    //$('.left-m-list li.selected').attr('data-report', JSON.stringify({
                    //    'Name': reportName,
                    //    'ConnectionString': connectionString,
                    //    'Query': sqlQuery,
                    //    'DatabaseType': dbType,
                    //    'FiltersJson': filtersJson
                    //})).removeClass('unsaved');

                    //$('.left-m-list li.selected span').text(reportName);

                    var index = $('.left-m-list li.selected').index();

                    refreshReports(true, function () {
                        $('.left-m-list li:nth-child(' + (index + 1) + ')').trigger('click');
                        Toast.show({ content: 'Rapor kaydedildi', type: TOAST_TYPE.SUCCESS });
                    });
                }
                else
                    Toast.show({ content: 'Rapor kaydedilemedi, lütfen tekrar deneyin', type: TOAST_TYPE.ERROR });
            }
        });
    });
});

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
    $('.report-builder-w').hide();
    $('.left-m-list').html('');

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
                    $('.left-m-list').append('<li data-id="' + report.Id + '">\
                                                <i class="material-icons">show_chart</i> <span>' + report.Name + '</span>\
                                                <button class="copy-report-btn" title="Raporu Kopyala"><i class="material-icons">content_copy</i></button>\
                                                <button class="delete-report-btn" title="Raporu Sil"><i class="material-icons">close</i></button>\
                                            </li>');
                    $('.left-m-list li:last').attr('data-report', JSON.stringify(report));
                });
            }
            else {
                $('.report-builder-w').hide();
                $('.report-nf').show();
            }

            if (typeof (callback) !== undefined)
                callback();
        }
    });
}

function loadPage() {
    setTimeout(function () {
        $('#loader').addClass('loaded');
    }, 2000);

    setTimeout(function () {
        $('body, .logo-w, .left-m, #page, .page-c').addClass('loaded');

        $('head').append('<style>\
            .header-w, .logo-w.loaded {background: ' + CONFIG.AdminSiteColor + ' !important;}\
            .progressbar li.active {color: ' + CONFIG.AdminSiteColor + ' !important;}\
            .progressbar li.active:before {border-color: ' + CONFIG.AdminSiteColor + ' !important;}\
            .left-m-list li:hover, .left-m-list li.selected {color: ' + CONFIG.AdminSiteColor + ' !important;}\
            button.step-btn {border: 1px solid ' + CONFIG.AdminSiteColor + ' !important; color: ' + CONFIG.AdminSiteColor + ' !important;}\
            button.step-btn:hover, button.step-btn[data-type="complete"] {background: ' + CONFIG.AdminSiteColor + ' !important; border: 1px solid ' + CONFIG.AdminSiteColor + ' !important; color:#fff !important;}\
            .choose-con-str-list li.new-con-str { color: ' + CONFIG.AdminSiteColor + ' !important; }\
            #og-loader {border-top-color: ' + CONFIG.AdminSiteColor + ' !important;}\
            #og-loader:before {border-top-color: ' + CONFIG.AdminSiteColor + ' !important;}\
            #og-loader:after {border-top-color: ' + CONFIG.AdminSiteColor + ' !important;}\
        </style>');

        $('#loader').hide();
    }, 2300);

    setTimeout(function () {
        $('.new-report-btn').addClass('loaded');
        $('.logo-w, .logo-w i').css('position', 'absolute');
    }, 3600);
}