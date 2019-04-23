$(document).ready(function(){
    $('.modal').modal();
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
    $(".updateLink").on('click', function(){
        var id = JSON.parse($(this).attr('data-target'));
        var state = $(this).attr('data-state');
        $("#adminSwitch").prop('checked', state);
        $('.modal').modal('open');
        $("#adminSwitch").on("change", function(){
            var c = $(this).prop('checked');
            $.ajax({
                url: '/adminStatusChange/'+id,
                type: 'PUT',
                data: `isAdmin=${c}`,
                success: function(result) {
                    alert("Value Changed");
                    $('.modal').modal('close');
                }
            }); 
        });
    });
});