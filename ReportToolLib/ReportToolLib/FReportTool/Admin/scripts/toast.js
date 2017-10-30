var TOAST_LENGTH = {
    SHORT: 2000,
    LONG: 6000
};

var TOAST_POSITION = {
    TOP_RIGHT: 'top-right',
    BOTTOM_RIGHT: 'bottom-right'
};

var TOAST_TYPE = {
    SUCCESS: 'success',
    WARNING: 'warning',
    ERROR: 'error',
    INFO: 'info'
};

var Toast = (function(){
    return{
        show: function(params){
            var options = {
                content: '',
                timeout: 4000,
                position: TOAST_POSITION.BOTTOM_RIGHT,
                bgColor: 'rgba(0, 0, 0, 0.9)',
                loaderBg: CONFIG.AdminSiteColor,
                type: '',
                textColor: '#fff',
                animation: 'slide',
                fontSize: '20px'
            };
            
            if(params)
                $.extend(options, params);

            //if (options.type == TOAST_TYPE.SUCCESS) {
            //    options.bgColor = 'rgba(0, 144, 10, 0.9)';
            //    options.loaderBg = '#00a2a2';
            //}

            $.toast({
                text: '<span style="font-size:' + options.fontSize + ';">' + options.content + '</span>',
                position: options.position,
                bgColor: options.bgColor,
                textColor: options.textColor,
                loaderBg: options.loaderBg,
                icon: options.type,
                hideAfter: options.timeout,
                showHideTransition: options.animation,
            });
        }
    }
})();