$(function() {

  var loggedIn = $('meta[name="logged-in"]').attr('content') === 'true';

	$(".collapse").collapse();
	$('#requestModal').modal({
	  keyboard: true,
	  show: false
  });

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
  $('.rate').click(function() {
    var modal = $('#rateModal');
    modal.modal();
    modal.on('shown', function() {
      var contentEl = modal.find('.modal-body');
      if (loggedIn) {
        contentEl.html('<p>Loading...</p>');
        contentEl.addClass('loading');
        var url = document.location.pathname + '/like';
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
            .html('<p>You are now watching <a href="' + url + '">this repo on Github</a>.</p>')
            ;
        });
      }
    });
  });

  //
  // Fork Article
  //
  $('.fork').click(function() {
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
  });

});

