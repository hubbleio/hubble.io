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

  $(function() {

    var menu = $('#menu');
    var moving = false;
    var hidden = false;

    function hide() {
      if (! moving && ! hidden) {
        moving = true;
        menu.animate({'left': "-=" + (menu.width() -20)}, 750, function() {
          moving = false;
          hidden = true;
        });
      }
    }

    function show() {
      if (! moving && hidden) {
        moving = true;
        menu.animate({'left': "0"}, 750, function() {
          moving = false;
          hidden = false;
        });
      }
    }

    menu.hover(show, hide);

    hide();
    
  });

}());