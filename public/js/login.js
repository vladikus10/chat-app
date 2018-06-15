$(document).ready(function(){
    var accessToken = localStorage.getItem('access_token');
    if(accessToken) window.location = '/chat';
});

function openLoginModal(){
    $('#authModalTitle').html('Login');
    $('#modalActionButton').html('Login');
    $('#modalActionButton').unbind("click")
    $('#modalActionButton').click(login);
    $('#authModal').modal();
}

function openRegisterModal(){
    $('#authModalTitle').html('Register');
    $('#modalActionButton').html('Register');
    $('#modalActionButton').unbind("click")
    $('#modalActionButton').click(register);
    $('#authModal').modal();
}

function login(){
    var credentials = {
        username: $('#username').val(),
        password: $('#password').val()
    };
    $.ajax({
        type: "POST",
        url: '/api/session',
        processData: false,
        contentType: 'application/json',
        data: JSON.stringify(credentials),
        success: function(result){
            localStorage.setItem('username', result.username);
            localStorage.setItem('user_id', result._id);
            localStorage.setItem('access_token', result.access_token);
            localStorage.setItem('refresh_token', result.refresh_token);
            window.location = '/chat';
        },
        error: function(error){
            handleErrors(error.responseJSON);
        }
    });
}

function register(){
    var credentials = {
        username: $('#username').val(),
        password: $('#password').val()
    };
    $.ajax({
        type: "POST",
        url: '/api/users',
        processData: false,
        contentType: 'application/json',
        data: JSON.stringify(credentials),
        success: function(result){
            $('#authModal').modal('hide');
            alert(result.message);
        },
        error: function(error){
            handleErrors(error.responseJSON);
        }
    });
}

