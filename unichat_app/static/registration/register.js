$('#username_input').ready(function() {
    $('#username_input').change(function() {
        var username = $(this).val();
        var csrfToken = $("[name=csrfmiddlewaretoken]").val();
        function csrfSafeMethod(method) {
            // these HTTP methods do not require CSRF protection
            return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
        }
        $.ajaxSetup({
            beforeSend: function(xhr, settings) {
                if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
                    xhr.setRequestHeader("X-CSRFToken", csrfToken);
                }
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
                    alert('Username \"' + username + '\" has already been taken.');
                }
            }
        });
    });
});