require("bootstrap");

(function ($, undefined) {
   "use strict";

   var $document = $(document),
       $nav = $('#navigation');
   $document.ready(function () {
      var h1 = 100;
      var h2 = 180;
      var ss = $document.scrollTop();
      $(window).scroll(function () {
         var s = $document.scrollTop();
         if (s < h1) {
            $nav.removeClass('fixed-nav');
         }
         if (s > h1) {
            $nav.addClass('fixed-nav');
         }
         if (s > h2) {
            $nav.addClass('toDown-nav');
            if (s > ss) {
               $nav.removeClass('toUp-nav');
            } else {
               $nav.addClass('toUp-nav');
            }
            ss = s;
         }
      });

      $(".scroll-down").arctic_scroll();
   });

   $.fn.arctic_scroll = function (options) {
      var defaults = {
             elem: $(this),
             speed: 500
          },

          allOptions = $.extend(defaults, options);

      allOptions.elem.click(function (event) {
         event.preventDefault();
         var $this = $(this),
             $htmlBody = $('html, body'),
             offset = ($this.attr('data-offset')) ? $this.attr('data-offset') : false,
             position = ($this.attr('data-position')) ? $this.attr('data-position') : false,
             toMove;

         if (offset) {
            toMove = parseInt(offset);
            $htmlBody.stop(true, false).animate({scrollTop: ($(this.hash).offset().top + toMove) }, allOptions.speed);
         } else if (position) {
            toMove = parseInt(position);
            $htmlBody.stop(true, false).animate({scrollTop: toMove }, allOptions.speed);
         } else {
            $htmlBody.stop(true, false).animate({scrollTop: ($(this.hash).offset().top) }, allOptions.speed);
         }
      });

   };


})(jQuery);
