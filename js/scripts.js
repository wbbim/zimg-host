$(function(){
	var appLocation = window.location;

	$('#btn-links').on('click', function() {
		$('#overlay').fadeIn(150);
		$('#links-menu').fadeIn(150);
		$('#links-menu select').trigger('change');
		$('#links-input').select();
	});

	$('#btn-links-close').on('click', function() {
		$('#overlay').fadeOut(150);
		$('#links-menu').fadeOut(150);
	});

	$('#links-menu select').on('change', function() {
		var target = $(this).find(':selected').attr('data-target');

		var text = '';

		$('.' + target).each(function(index, value) {
			text += $(this).val() + '\n';
		});

		$('#links-input').val(text);
		$('#links-input').select();
	});

	$('#btn-url').on('click', function() {
		$('#overlay').fadeIn(150);
		$('#url-menu').fadeIn(150);
		$('#url-menu textarea').focus();
	});

	$('#btn-url-clear').on('click', function() {
		$('#url-menu textarea').val('');
		$('#url-menu textarea').focus();
	});

	$('#btn-url-close').on('click', function() {
		$('#overlay').fadeOut(150);
		$('#url-menu').fadeOut(150);
	});

	$('#btn-disc').on('click', function() {
		$('#file-input').click();
	});

	$('#file-input').on('change', function() {
		$('#form-input').ajaxForm({
			beforeSend: function() {
				$('.progress').css('display', 'block');
				updatePercentValue(0);
			},
			uploadProgress: function(event, position, total, percentComplete) {
				updatePercentValue(percentComplete);
			},
		    success: function() {
		    	updatePercentValue(100);
		    },
			complete: function(xhr) {
				addImagesFromArray(xhr.responseText);
			}
		}).submit();
	});

	$('#btn-url-upload').on('click', function() {
		var inputValue = $('#url-input').val();
		if (inputValue.length == 0) {
			$('#url-menu textarea').focus();
			return;
		}

		var inputArray = inputValue.split('\n');

		$.post("upload.php", {urls: inputArray}, function(data) {
			$('#btn-url-clear').trigger('click');
			$('#btn-url-close').trigger('click');
			addImagesFromArray(data);
		});
	});
	
	function addImagesFromArray(text) {
		var result = JSON.parse(text);

		for (var i = 0; i < result.length; i++) {
			var fileName = result[i].name;

			if (result[i].error.upload == 1) {
				var errorTypeText = 'Reason: ';

				if (result[i].error.type == 1) {
					errorTypeText += 'bad type';
					errorTypeText += ', ';
				}

				if (result[i].error.size == 1) {
					errorTypeText += 'bad size';
					errorTypeText += ', ';
				}

				if (result[i].error.host == 1) {
					errorTypeText += 'this host is blacklisted';
					errorTypeText += ', ';
				}

				if (result[i].error.type == 0 && result[i].error.size == 0 && result[i].error.host == 0) {
					errorTypeText = 'server error';
					errorTypeText += ', ';
				}

				errorTypeText = errorTypeText.slice(0, errorTypeText.length - 2);
				errorTypeText += '.';

				$.post('file_item_error.php', {name: fileName, error: errorTypeText}, function(data) {
					$('#file-list').append(data);
				});

				continue;
			}

			var fileUrl = appLocation + result[i].url;
			var fileThumbnailUrl = appLocation + 'thumb/' + result[i].url;
			var fileSize = result[i].size;

			$.post('file_item.php', {url: fileUrl, thumbUrl: fileThumbnailUrl, name: fileName, size: fileSize}, function(data) {
				$('#file-list').append(data);

				if ($('.file-item').length > 1) {
					$('#get-all-link').show();
				}
			});
		}
	}

	function updatePercentValue(percent) {
		$('.file-progress-bar').css('width', percent + '%');
		$('.file-progress-percent').html(percent + '%');
	}
});
