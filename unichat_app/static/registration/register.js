var usernameIsValid = false;
var passwordIsValid = false;
var emailIsValid = false;

var NORMAL_BORDER_COLOR;

function setUsernameValidation(isValid) {
    var usernameInput = $('#username_input');
    if (usernameInput.val() !== '') {
        if (isValid) {
            $('#username_valid_indicator').show();
            $('#username_invalid_indicator').hide();
            usernameInput.css('border-color', NORMAL_BORDER_COLOR);
        }
        else {
            $('#username_invalid_indicator').show();
            $('#username_valid_indicator').hide();
            usernameInput.css('border-color', 'red');
        }
    }
    else {
        $('#username_invalid_indicator').hide();
        $('#username_valid_indicator').hide();
        usernameInput.css('border-color', NORMAL_BORDER_COLOR);
    }
    usernameIsValid = isValid;
    setSignUpBtnAvailability();
}

function setPasswordValidation(isValid) {
    var pswd_input = $('#pswd_input');
    var confirm_pswd_input = $('#confirm_pswd_input');
    if (pswd_input.val() == '' || confirm_pswd_input == '') {
        $('#confirm_pswd_invalid_indicator').hide();
        $('#confirm_pswd_valid_indicator').hide();
        confirm_pswd_input.css('border-color', NORMAL_BORDER_COLOR);
    }
    else {
        if (isValid) {
            confirm_pswd_input.css('border-color', NORMAL_BORDER_COLOR);
            $('#confirm_pswd_valid_indicator').show();
            $('#confirm_pswd_invalid_indicator').hide();
        }
        else {
            confirm_pswd_input.css('border-color', 'red');
            $('#confirm_pswd_invalid_indicator').show();
            $('#confirm_pswd_valid_indicator').hide();
        }
    }
    passwordIsValid = isValid;
    setSignUpBtnAvailability();
}

function setEmailValidation(isValid) {
    var emailInput = $('#email_input');
    if (emailInput.val() !== '') {
        if (isValid) {
            $('#email_valid_indicator').show();
            $('#email_invalid_indicator').hide();
            emailInput.css('border-color', NORMAL_BORDER_COLOR);
        }
        else {
            $('#email_invalid_indicator').show();
            $('#email_valid_indicator').hide();
            emailInput.css('border-color', 'red');
        }
    }
    else {
        $('#email_invalid_indicator').hide();
        $('#email_valid_indicator').hide();
        emailInput.css('border-color', NORMAL_BORDER_COLOR);
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
    $('#username_input').keyup(function() {
        var username = $(this).val();
        if (username !== '')
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
        else setUsernameValidation(false);
    });

    /* Validates the password. */
    $('#confirm_pswd_input').keyup(function() {
        var pswd_input = $('#pswd_input');
        var confirm_pswd_input_input = $(this);
        if ( pswd_input.val() !== '' && confirm_pswd_input_input.val() !== '') {
            if (confirm_pswd_input_input.val() !== pswd_input.val())
                setPasswordValidation(false);
            else
                setPasswordValidation(true);
        }
        else setPasswordValidation(false);
    });

    /* Validates the email. */
    $('#email_input').keyup(function() {
        var email = $(this).val();
        if (email !== '')
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
        else setEmailValidation(false);
    });

    setSignUpBtnAvailability();
});