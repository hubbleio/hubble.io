;(function() {

  $(document).ajaxError(function(event, request, settings) {
    alert(request.responseText);
  });

  $('.like').click(function(ev) {
    ev.preventDefault();

    var button = $(this);
    var action = button.attr('data-action');

    console.log(action);
    $.post(action, function(watchers) {
      button.html(watchers);
    });

  });

}());