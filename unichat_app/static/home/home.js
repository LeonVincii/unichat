var NORMAL_CONTACT_BACKGROUND_COLOR = 'rgb(249, 249, 249)';
var CLICKED_CONTACT_BACKGROUND_COLOR = 'rgb(223, 223, 223)';

function ele(id) {
    return document.getElementById(id);
}

function setupAjaxCsrf() {
    var csrfToken = Cookies.get('csrftoken');

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
}

function requestUserModel(username) {
    $.ajax({
        type: 'POST',
        url: '/ajax_user_detail/',
        data: {
            'username': username
        },
        dataType: 'json',
        success: fillRightPanel
    });
}

function requestAddingChat(selectedContactUsername) {
    $.ajax({
        type: 'POST',
        url: '/ajax_add_chat/' + selectedContactUsername + '/',
        success: function() {
                requestContentForElement('#chat_list_panel', function() {
                initBulletinChatSize();
                initRightPanel();
                var msgRemarknamePlaceholder = $('#msg_remark_name');
                var defaultSelectedChat = $('#bulletin_chat');
                defaultSelectedChat.css('backgroundColor', CLICKED_CONTACT_BACKGROUND_COLOR);
                msgRemarknamePlaceholder.text(defaultSelectedChat.text());
                $('#chat_username_container').val(defaultSelectedChat.find('.bulletin_chat_username').val());
            });
            $('#chat_list_btn').click();
        }
    });
}

function requestDeletingChat(selectedContactUsername) {
    $.ajax({
        type: 'DELETE',
        url: '/ajax_delete_chat/' + selectedContactUsername + '/',
        success: function() {
            requestContentForElement('#chat_list_panel', function() {
                initBulletinChatSize();
                initRightPanel();
                var msgRemarknamePlaceholder = $('#msg_remark_name');
                var defaultSelectedChat = $('#bulletin_chat');
                defaultSelectedChat.css('backgroundColor', CLICKED_CONTACT_BACKGROUND_COLOR);
                msgRemarknamePlaceholder.text(defaultSelectedChat.text());
                $('#chat_username_container').val(defaultSelectedChat.find('.bulletin_chat_username').val());
            });
            $('#chat_list_btn').click();
        }
    });
}

function requestContentForElement(elementID, callback) {
    $.ajax({
        type: 'GET',
        url: location.href,
        dataType: 'html',
        success: function(data) {
            page = $(data);
            newContent = page.find(elementID).html();
            $(elementID).html(newContent);
            if (typeof callback === 'function')
                callback();
        }
    });
}

function fillRightPanel(userObj) {
    /* Fills the user detail page using the user json obj from server. */
    $('#contact_username_placeholder').text(userObj['username']);
    $('#contact_email_placeholder').text(userObj['email']);
}

$(document).ready(function() {
    setupAjaxCsrf();
});

$(window).resize(function() {
        /* Reset the height of ContactListPanel whenever the view port is resized. */
        ele('contact_list_panel').style.height = ele('mid_col').offsetHeight - ele('search_panel').offsetHeight + 'px';

        initRightPanel();
});

$('#left_col').ready(function() {
    /* Left button controller.
     * Makes sure that there is always one and only one option selected in the left panel;
     * Also switches the right panel according to the selected option. */
    $(document).on('click', '.left_btn', function() {
        if (!this.classList.contains('active')) {
            $(this).addClass('active');
            $('.left_btn').not(this).removeClass('active');
            $('.right_col_content').hide();
            $('.friend_list').hide();
            $('.search_add_placeholder').hide();
            var midCol = $('#mid_col');
            switch (this.id) {
                case 'user_avatar_placeholder':
                    midCol.hide();
                    $('#right_col_profile').show();
                    break;
                case 'chat_list_btn':
                    midCol.show();
                    var chatListPanel = $('#chat_list_panel');
                    chatListPanel.show();
                    if (chatListPanel.children().length > 0) {
                        $('#right_col_chat').show();
                    }
                    $('#search_btn_placeholder').show();
                    break;
                case 'contact_list_btn':
                    midCol.show();
                    $('#contact_list_panel').show();
                    $('#right_col_info').show();
                    $('#add_btn_placeholder').show();
                    break;
                case 'settings_btn':
                    midCol.hide();
                    $('#right_col_settings').show();
                    break;
            }
        }
    });

    initMidPanel();
});

function initBulletinChatSize() {
    /* Sets the width of name col of bulletin chat. */
    var bulletinChatAvatarCol = $('.bulletin_chat_avatar_col');
    var bulletinChatNameCol = $('.bulletin_name_col');
    var bulletinChatDeleteCol = $('.bulletin_chat_delete_col');
    var midCol = $('#mid_col');
    bulletinChatNameCol.css('width', midCol.width() - bulletinChatAvatarCol.outerWidth()
                                                    - bulletinChatDeleteCol.outerWidth() - 20 /* left and right padding */ + 'px');
}

function initMidPanel() {
    /* Sets contact friend list height. */
    $('.friend_list').css('height', ele('mid_col').offsetHeight - ele('search_panel').offsetHeight + 'px');
    /* Sets search and add btn size. */
    var searchAddBtn = $('.search_add_btn');
    searchAddBtn.css('height', ele('search_input').offsetHeight + 'px');
    searchAddBtn.css('width', ele('search_input').offsetHeight + 'px');

    initBulletinChatSize();

    $('#mid_col').ready(function() {
        setupMidPanelClickEvents();
    });
}

function selectContact(username) {
    var contactListBtn = $('#contact_list_btn');
    if (!contactListBtn.hasClass('active')) {
        contactListBtn.click();
    }
    var contacts = $('.bulletin_contacts');
    for (var index = 0; index < contacts.length; index ++) {
        console.log($(contacts[index]).find('.bulletin_contact_username').val());
        if ($(contacts[index]).find('.bulletin_contact_username').val() == username) {
            $(contacts[index]).css('backgroundColor', CLICKED_CONTACT_BACKGROUND_COLOR);
            var remarkname = $(contacts[index]).text();
            $('#contact_remarkname_placeholder').text(remarkname);
            $('#contact_remarkname').val($.trim(remarkname));
            requestUserModel(username);
        }
        else
            $(contacts[index]).css('backgroundColor', NORMAL_CONTACT_BACKGROUND_COLOR);
    }
}

function setDefaultSelection() {
    /* When the list is initialized, the first one in the list is selected by default. */
    var msgRemarknamePlaceholder = $('#msg_remark_name');
    var contactRemarknamePlaceholder = $('#contact_remarkname_placeholder');
    if (msgRemarknamePlaceholder.text() == '') {
        var defaultSelectedChat = $('#bulletin_chat');
        defaultSelectedChat.css('backgroundColor', CLICKED_CONTACT_BACKGROUND_COLOR);
        msgRemarknamePlaceholder.text(defaultSelectedChat.text());
        $('#chat_username_container').val(defaultSelectedChat.find('.bulletin_chat_username').val());
    }
    if (contactRemarknamePlaceholder.text() == '') {
        var defaultSelectedContact = $('#bulletin_contact');
        defaultSelectedContact.css('backgroundColor', CLICKED_CONTACT_BACKGROUND_COLOR);
        contactRemarknamePlaceholder.text(defaultSelectedContact.text());
        $('#contact_remarkname').val($.trim(defaultSelectedContact.text()));
        var selectedContactUsername = defaultSelectedContact.find('.bulletin_contact_username').val();
        requestUserModel(selectedContactUsername);
    }

}

function setupMidPanelClickEvents() {

    setDefaultSelection();

    /* Changes the selected contact by clicking. */
    $(document).on('click', '.contact_placeholder', function() {
        if (this.style.backgroundColor != CLICKED_CONTACT_BACKGROUND_COLOR) {
            this.style.backgroundColor = CLICKED_CONTACT_BACKGROUND_COLOR;
            if ($(this).hasClass('bulletin_chats')) {
                $('.bulletin_chats').not(this).css('backgroundColor', NORMAL_CONTACT_BACKGROUND_COLOR);
                /* Sets the chat title to be the contact's remark name. */
                $('#msg_remark_name').text($(this).text());
                var selectedChatUsername = $(this).find('.bulletin_chat_username').val();
                $('#chat_username_container').val(selectedChatUsername);
            }
            else if ($(this).hasClass('bulletin_contacts')) {
                $('.bulletin_contacts').not(this).css('backgroundColor', NORMAL_CONTACT_BACKGROUND_COLOR);
                /* Gets the username of the selected contact */
                var selectedContactUsername = $(this).find('.bulletin_contact_username').val();
                $('#contact_remarkname_placeholder').text($(this).text());
                $('#contact_remarkname').val($.trim($(this).text()));
                requestUserModel(selectedContactUsername);
            }
        }
    });
    $(document).on('click', '.delete_chat_btn', function() {
        var selectedChatUsername = $(this).parent().parent().find('.bulletin_chat_username').val();
        requestDeletingChat(selectedChatUsername);
    });

    initRightPanel();
}

/* Initializes the right panel eleonents based on which option is selected. */
function initRightPanel() {
    if ($('#chat_list_btn').hasClass('active') && $('#chat_list_panel').children().length > 0) {
        /* If the chat list is not empty, the chat panel shows. */
        $('#right_col_chat').show();
        /* Sets right col width. */
        ele('right_col').style.width = $(window).width() - ele('left_col').offsetWidth - ele('mid_col').offsetWidth
                                                          - 1 /* perfectly fit in size seems would occur problems on safari, don't know the reason now,
                                                               * so leave 1px blank space to ensure it works across browsers */ + 'px';
        /* Sets msg display title height and width. */
        ele('msg_display_header').style.height = ele('search_panel').offsetHeight + 'px';
        /* Sets type area height. */
        ele('msg_typing_area').style.height = ele('msg_typing_window').offsetHeight - ele('msg_send_btn_placeholder').offsetHeight + 'px';
        /* Sets the height and width of msg input. */
        ele('msg_typing_input').style.height = ele('msg_typing_area').offsetHeight - 10 /* the top padding */ + 'px';
        ele('msg_typing_input').style.width = ele('msg_typing_area').offsetWidth - 21 /* the sum of left and right padding + 1px */ + 'px';
        /* Sets the height of msg display window. */
        ele('msg_display_window').style.height = $(window).height() - ele('msg_typing_window').offsetHeight - ele('msg_display_header').offsetHeight + 'px';
    }
    else
        $('#right_col_chat').hide();
}

$('#right_col_info').ready(function() {
    $('#start_chat_btn').click(function() {
        requestAddingChat($('#contact_username_placeholder').text());
    })
});

$('#right_col_chat').ready(function() {
    $('#msg_contact_info').click(function() {
        selectContact($('#chat_username_container').val());
    });
});
