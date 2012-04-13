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
    var needsHiding = false;
    var needsShowing = false;

    function hide() {
      if (! moving && ! hidden) {
        moving = true;
        needsShowing = false;
        menu.animate({'left': "-=" + (menu.width() -20)}, 750, function() {
          moving = false;
          hidden = true;
          if (needsShowing) { show(); }
        });
      } else {
        needsHiding = true;
        needsShowing = false;
      }
    }

    function show() {
      if (! moving && hidden) {
        moving = true;
        needsHiding = false;
        menu.animate({'left': "0"}, 300, function() {
          moving = false;
          hidden = false;
          if (needsHiding) { hide(); }
        });
      } else {
        needsHiding = false;
        needsShowing = true;
      }
    }

    menu.hover(show, hide);

    hide();
    
  });

}());