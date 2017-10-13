$('#register_form').ready(function() {
    var NORMAL_BORDER_COLOR = $('.register_input').css('border-color');
    /* Validates the username. */
    $('#username_input').change(function() {
        var username = $(this).val();
        var csrfToken = $("[name=csrfmiddlewaretoken]").val();
        function csrfSafeMethod(method) {
            /* These HTTP methods do not require CSRF protection. */
            return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
        }
        $.ajaxSetup({
            beforeSend: function(xhr, settings) {
                if (!csrfSafeMethod(settings.type) && !this.crossDomain)
                    xhr.setRequestHeader("X-CSRFToken", csrfToken);
            }
        });
        $.ajax({
            type: 'POST',
            url: '/signup_username_validation/',
            data: {
                'username': username
            },
            dataType: 'json',
            success: function(data) {
                if (data.has_taken) {
                    $('#username_invalid_indicator').show();
                    $('#username_valid_indicator').hide();
                    $('#username_input').css('border-color', 'red');
                }
                else {
                    $('#username_valid_indicator').show();
                    $('#username_invalid_indicator').hide();
                    $('#username_input').css('border-color', NORMAL_BORDER_COLOR);
                }
            }
        });
    });

    /* Validates the password. */
    $('#confirm_pswd_input_input').change(function() {
        var pswd_input = $('#pswd_input');
        var confirm_pswd_input_input = $(this);
        if (confirm_pswd_input_input.val() !== pswd_input.val()) {
            pswd_input.css('border-color', 'red');
            confirm_pswd_input_input.css('border-color', 'red');
            $('#pswd_invalid_indicator').show();
            $('#confirm_pswd_invalid_indicator').show();
            $('#pswd_valid_indicator').hide();
            $('#confirm_pswd_valid_indicator').hide();
        }
        else {
            $('#pswd_valid_indicator').show();
            $('#confirm_pswd_valid_indicator').show();
            $('#pswd_invalid_indicator').hide();
            $('#confirm_pswd_invalid_indicator').hide();
            pswd_input.css('border-color', NORMAL_BORDER_COLOR);
            confirm_pswd_input_input.css('border-color', NORMAL_BORDER_COLOR);
        }
    })
});