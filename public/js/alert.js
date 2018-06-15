function handleErrors(errors){
    console.log(errors);
    if(errors.errors){
        for(let error of errors.errors){
            alert('Error: ' + error.messages.join(', '), 'danger');
        }
    }
    else if(errors.message){
        alert('Error: ' + errors.message, 'danger');
    }
    else{
        alert('Error: unknown error occured', 'danger');
    }
}

function alert(message, type='success'){
    $('#container').append('<div class="fixed-alert alert alert-' + type + ' alert-dismissible fade show" role="alert">'
    +   message
    +   '<button type="button" class="close" data-dismiss="alert" aria-label="Close">'
    +       '<span aria-hidden="true">&times;</span>'
    +    '</button>'
    +   '</div>');
}