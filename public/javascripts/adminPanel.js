$(document).ready(function(){
    $('.modal').modal();

    $('.adminSwitch').each(function(i, obj) {
        console.log(obj)
        if($(this).attr('data-admin')=="true"){
            $(this).prop('checked', true);
        }
        if($(this).attr('data-admin')=="false"){
            $(this).prop('checked', false);
        }
    });

    $(".deleteLink").on('click', function(){
        var id = this.id;
        $(this).parent().parent().remove();
        $.ajax({
            url: '/users/'+ id,
            type: 'DELETE',
            success: function(result) {
                alert("Deleted");
            }
        });
    });
    $(".adminSwitch").on('click', function(){
        var id = JSON.parse($(this).attr('data-target'));
        var state= $(this).prop('checked');
        $.ajax({
            url: '/adminStatusChange/'+id,
            type: 'PUT',
            data: `isAdmin=${state}`,
            success: function(result) {
                alert("Value Changed");
            }
        });
    });
});