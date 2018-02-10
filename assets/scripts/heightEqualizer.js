(function($){
    function equalizeHeights(selector, selector2, selector3) {
        var heights = [];

        $(selector).each(function() {
            $(this).css('min-height', '0');
            $(this).css('max-height', 'none');
            $(this).css('height', 'auto');

            heights.push($(this).height());
        });

        $(selector2).each(function(index) {
            $(this).css('height', (heights[index] + 22) + 'px');
        });

        $(selector3).each(function(index) {
            $(this).css('line-height', (heights[index] + 2) + 'px');
        });
    }

    $(window).load(function() {
        // Fix heights on page load
        equalizeHeights('.question', '.spyBox', '.vcent');

        // Fix heights on window resize
        $(window).resize(function() {

            // Needs to be a timeout function so it doesn't fire every ms of resize
            setTimeout(function() {
                equalizeHeights('.question', '.spyBox', '.vcent');
            }, 120);
        });
    });
    equalizeHeights();
})(jQuery);
