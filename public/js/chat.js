var accessToken, refreshToken, username, userId;

$(document).ready(function(){
    username = localStorage.getItem('username');
    userId = localStorage.getItem('user_id');
    accessToken = localStorage.getItem('access_token');
    refreshToken = localStorage.getItem('refresh_token');

    if(!accessToken && !refreshToken) return window.location = '/';

    $('#usernameDisplay').html(username);

    api('/users', function(users){
        fillUsers(users);
    });
}); 

function fillUsers(users){
    console.log(users);
    for(var user of users){
        $('#userList').append('<li class="list-group-item" onclick="openChat(\'' + user._id + '\')">' + user.username + '</li>');
    }
}

function openChat(id){
    api('/messages/' + id, function(messages){
        console.log('Yes');
        console.log(messages);
    });
}

function api(url, cb){
    $.ajax({
        type: 'GET',
        url: '/api' + url,
        headers: {
            'x-access-token': accessToken
        },
        contentType: 'application/json',
        success: function(result){
            cb(result);
        },
        error: function(error){
            if(error.status === 403){
                localStorage.clear();
                return window.location = '/';
            } 
            handleErrors(error.responseJSON);
        }
    });
}