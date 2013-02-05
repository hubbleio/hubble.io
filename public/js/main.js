$(function() {

  var loggedIn = $('meta[name="logged-in"]').attr('content') === 'true';

  //
  // Handle AJAX errors
  //
  $(document).ajaxError(function(e, xhr) {
    if (xhr.status == 403) {
      if (confirm('You have been logged out. Click Ok to log in using GitHub.')) {
        document.location = '/auth/github';
      }
    } else {
      alert('Some error happened, please try again later.');
    }
  });

  //
  // Modal dialogues
  //
	$('#requestModal').modal({ keyboard: true, show: false });
  $('#contactModal').modal({ keyboard: true, show: false });

  $('.modal').on('show', function() {
    var $this = $(this);
    if (loggedIn) {
      $this.find('.alert.not-loggedin').hide();
    } else {
      $this.find('.loggedin-only').remove();
    }
  });

  $('.modal').on('shown', function() {
    var $this = $(this);
    if (! loggedIn) { return; }
    var dynamic = $this.find('.modal-body-dynamic');
    dynamic
      .addClass('loading')
      .load(dynamic.attr('data-source'), function() {
        dynamic.removeClass('loading');
      })
      ;
  });

  //
  // Rate Article
  //
  $('.star').click(function(ev) {
    var button = $(this);
    console.log(button.attr('href'));
    var modal = $('#starModal');
    modal.modal();
    modal.on('shown', function() {
      var contentEl = modal.find('.modal-body');
      if (loggedIn) {
        contentEl.html('<p>Loading...</p>');
        contentEl.addClass('loading');
        var url = button.attr('href') || (document.location.pathname + '/star');

        $.post(url, function(content) {
          var url;
          try {
            var resp = JSON.parse(content);
            url = resp.url;
          } catch(err) {
            // Do nothing
          }
          contentEl
            .removeClass('loading')
            .html('<p>You are now watching <a href="' + url + '">this repo on Github</a>.</p>')
            ;
        });
      }
    });

    ev.stopPropagation();
    ev.preventDefault();
    return false;
  });

  //
  // Fork Article
  //
  $('.fork').click(function(ev) {
    var modal = $('#forkModal');
    modal.modal();
    modal.on('shown', function() {
      var contentEl = modal.find('.modal-body');
      if (loggedIn) {
        contentEl.html('<p>Loading...</p>');
        contentEl.addClass('loading');
        var url = document.location.pathname + '/fork';
        console.log(url);
        $.post(url, function(content) {
          var url;
          try {
            var resp = JSON.parse(content);
            url = resp.url;
          } catch(err) {
            // Do nothing
          }
          contentEl
            .removeClass('loading')
            .html('<p>This article has now been forked into <a href="' + url + '">this Github repo</a>.</p>')
            ;
        });
      }
    });

    ev.stopPropagation();
    ev.preventDefault();
    return false;
  });


  //
  // Resize video iframes
  //
  (function() {
    $('.article-body iframe').each(function(idx, iframe) {
      iframe = $(iframe);
      var width = iframe.width();
      var height = iframe.height();
      var ratio = width / height;
      var newWidth = iframe.parent().width();
      var newHeight = Math.ceil(newWidth / ratio);
      iframe.animate({
        width: newWidth,
        height: newHeight
      });
    });
  }());


  //
  // Button to expand / collapse all author articles
  //
  $('.btn-all-articles').click(function() {
    var $this = $(this),
        target = $($this.attr('data-target')),
        collapsed = target.hasClass('collapsed');

    if (collapsed) {
      target.slideDown();
      target.removeClass('collapsed');
      $this.text('Hide');
    } else {
      target.slideUp();
      target.addClass('collapsed');
      $this.text('Show all articles');
    }
  });

});