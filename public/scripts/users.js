$(document).ready(function() {
    // Function to open edit modal with user details
    $(".user-card").click(function() {

        var userId = $(this).data('id');
        
        $.ajax({
            url: '/getUserDetails', // Endpoint to get user details
            type: 'GET',
            data: { id: userId },
            success: function(user) {
                $("#headername").text(`Edit ${user.firstName}'s profile`);
                $("#edit-first-name-input").val(user.firstName);
                $("#edit-last-name-input").val(user.lastName);
                $("#edit-role-input").val(user.role);

                console.log(user.firstName, user.lastName, user.role)

                $(".edit-user-modal").show();
            },
            error: function(error) {
                console.log(error);
                Swal.fire('Error', 'Failed to fetch user details', 'error');
            }
        });
    });

    // Function to close the modals
    $(".exit, .exit-edit").click(function() {
        $(".add-user-modal, .edit-user-modal").hide();
    });
});
