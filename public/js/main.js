$(function() {

  var loggedIn = $('meta[name="logged-in"]').attr('content') === 'true';

	$(".collapse").collapse();
	$('#requestModal').modal({
	  keyboard: true,
	  show: false
  });


  $('.modal').on('show', function() {
    console.log('modal show');
    if (loggedIn) {
      $(this).find('.alert.not-loggedin').hide();
    }
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

