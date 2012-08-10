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

	$(".collapse").collapse();
	$('#requestModal').modal({ keyboard: true, show: false });

  //
  // Form drop-down menus
  //
  $('form .dropdown-menu li a').live('click', function(ev) {
    var $this = $(this);
    var value = $this.attr('data-value') || $this.html();
    console.log('value:', value);
    var form = $this.parents('form');
    $this.parentsUntil(form, '.btn-group')
      .find('.dropdown-toggle')
        .html(value + ' <span class="caret"></span>');

    var argName = $this.parentsUntil(form, '.dropdown-menu').attr('data-name');
    var hidden = form.find('input[name="' + argName + '"]');
    if (hidden.size() < 1) {
      var hidden = $('<input type="hidden" name="' + argName + '" />');
      hidden.val(value);
      hidden = form.append(hidden);
    } else {
      hidden.val(value);
    }

    ev.stopPropagation();
    ev.preventDefault();
  });


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
  $('.rate').click(function(ev) {
    var button = $(this);
    console.log(button.attr('href'));
    var modal = $('#rateModal');
    modal.modal();
    modal.on('shown', function() {
      var contentEl = modal.find('.modal-body');
      if (loggedIn) {
        contentEl.html('<p>Loading...</p>');
        contentEl.addClass('loading');
        var url = button.attr('href') || (document.location.pathname + '/like');
        
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
  // Expand Link
  //
  $('.expand').click(function(ev) {
    var $this = $(this);
    var expandable = $this.parents('.expandable');
    var container = expandable.parent();
    expandable.animate({
      width: container.width()
    }, function() {
      expandable.find('.article-body').trigger('resize');
    });

    $this.hide();

    
    ev.stopPropagation();
    ev.preventDefault();
    return false;
  });

  //
  // Expand all iframes containing videos
  //
  $('.article-body').on('resize', function() {
    $this = $(this);
    $this.find('iframe').each(function(idx, iframe) {
      iframe = $(iframe);
      var width = iframe.width();
      var height = iframe.height();
      var ratio = width / height;
      var newWidth = $this.width();
      var newHeight = Math.ceil(newWidth / ratio);
      iframe.animate({
        width: newWidth,
        height: newHeight
      });
    });
  })
  .trigger('resize')
  ;

});