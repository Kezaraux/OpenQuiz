$(function () {
    $('[data-toggle="tooltip"]').tooltip()
});
$('.flag').click(function() {
    $(this).toggleClass("active");
     var num = $(this).attr("name").substring(8, $(this).attr("name").length);
     $("[name='display" + num + "']").toggleClass("uncertain");
});
$("input").click(function() {
    for (var i = 0; i < $(".question").length; i++) {
        if ($("input[name=answer" + (i + 1) + "]").is(":checked")) {
            $("[name='display" + (i + 1) + "']").addClass("active");
        }
    }  
  });
