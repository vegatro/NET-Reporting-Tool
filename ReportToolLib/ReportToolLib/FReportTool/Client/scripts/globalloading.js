var GlobalLoading = (function(){
    return{
        show: function(){
            $('body').append('<div id="og-loader-overlay"></div>');
            $('body').append('<div id="og-loader" style="display:none;"></div>');

            //$('#loadingBox:last-child').css('left', ($(window).width() - $('#loadingBox').width()) / 2);
            //$('#loadingBox:last-child').css('top', ($(window).height() - $('#loadingBox').height()) / 2);

            $('#og-loader:last-child').fadeIn(300);
        },
        hide: function(){
            setTimeout(function() {
                $('#og-loader-overlay').fadeOut(200);
                $('#og-loader').fadeOut(200);

                setTimeout(function() {
                    $('#og-loader-overlay').remove();
                    $('#og-loader').remove();
                }, 0);
            }, 200);
        }
    }
})();