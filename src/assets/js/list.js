require("bootstrap");

(function ($, undefined) {
    "use strict";

    var $document = $(document),
        $nav = $('#navigation');
    $document.ready(function () {
        var h = 80;
        var temp = 0;
        $(window).scroll(function () {
            var s = $document.scrollTop();
            if (s < h) {
                $nav.removeClass('fixed-nav');
                $nav.removeClass('show-nav');
            }
            if (s > h) {
                $nav.addClass('fixed-nav');
                if(s > temp){
                    $nav.removeClass('show-nav');
                }else{
                    $nav.addClass('show-nav');
                }
                temp = s;
            }
        });
    });

})(jQuery);