var usernameIsValid = false;
var passwordIsValid = false;
var emailIsValid = false;

var NORMAL_BORDER_COLOR;

function setUsernameValidation(isValid) {
    if (isValid) {
        $('#username_valid_indicator').show();
        $('#username_invalid_indicator').hide();
        $('#username_input').css('border-color', NORMAL_BORDER_COLOR);
    }
    else {
        $('#username_invalid_indicator').show();
        $('#username_valid_indicator').hide();
        $('#username_input').css('border-color', 'red');
    }
    usernameIsValid = isValid;
    setSignUpBtnAvailability();
}

function setPasswordValidation(isValid) {
    var pswd_input = $('#pswd_input');
    var confirm_pswd_input = $('#confirm_pswd_input');
    if (isValid) {
        pswd_input.css('border-color', NORMAL_BORDER_COLOR);
        confirm_pswd_input.css('border-color', NORMAL_BORDER_COLOR);
        $('#pswd_valid_indicator').show();
        $('#confirm_pswd_valid_indicator').show();
        $('#pswd_invalid_indicator').hide();
        $('#confirm_pswd_invalid_indicator').hide();
    }
    else {
        pswd_input.css('border-color', 'red');
        confirm_pswd_input.css('border-color', 'red');
        $('#pswd_invalid_indicator').show();
        $('#confirm_pswd_invalid_indicator').show();
        $('#pswd_valid_indicator').hide();
        $('#confirm_pswd_valid_indicator').hide();
    }
    passwordIsValid = isValid;
    setSignUpBtnAvailability();
}

function setEmailValidation(isValid) {
    if (isValid) {
        $('#email_valid_indicator').show();
        $('#email_invalid_indicator').hide();
        $('#email_input').css('border-color', NORMAL_BORDER_COLOR);
    }
    else {
        $('#email_invalid_indicator').show();
        $('#email_valid_indicator').hide();
        $('#email_input').css('border-color', 'red');
    }
    emailIsValid = isValid;
    setSignUpBtnAvailability();
}

function setSignUpBtnAvailability() {
    var signUpBtn = $('#submit_btn');
    signUpBtn.prop('disabled', !(usernameIsValid && passwordIsValid && emailIsValid));
}

$('#register_form').ready(function() {

    NORMAL_BORDER_COLOR = $('.register_input').css('border-color');

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

    /* Validates the username. */
    $('#username_input').change(function() {
        var username = $(this).val();
        $.ajax({
            type: 'POST',
            url: '/ajax_signup_validation/',
            data: {
                'field': 'username',
                'username': username
            },
            dataType: 'json',
            success: function(data) {
                if (data.username_has_taken)
                    setUsernameValidation(false);
                else
                    setUsernameValidation(true);
            }
        });
    });

    /* Validates the password. */
    $('#confirm_pswd_input').change(function() {
        var pswd_input = $('#pswd_input');
        var confirm_pswd_input_input = $(this);
        if (confirm_pswd_input_input.val() !== pswd_input.val())
            setPasswordValidation(false);
        else
            setPasswordValidation(true);
    });

    /* Validates the email. */
    $('#email_input').change(function() {
        var email = $(this).val();
        $.ajax({
            type: 'POST',
            url: '/ajax_signup_validation/',
            data: {
                'field': 'email',
                'email': email
            },
            dataType: 'json',
            success: function(data) {
                if (data.email_has_taken)
                    setEmailValidation(false);
                else
                    setEmailValidation(true);
            }
        });
    });

    setSignUpBtnAvailability();
});