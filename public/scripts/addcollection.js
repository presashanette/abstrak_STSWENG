$(document).ready(function(){
    $("#upload-icon").click(function(){
        $("#imageInput").click();
    });

 
    
    $("#imageInput").change(function(event){
        var file = this.files[0];
        var reader = new FileReader();
        reader.onload = function(e){
            $(".main-picture").css("background-image", "url("+e.target.result+")");
        }
        reader.readAsDataURL(file);
    });

    $("button").click(function(){
        var name = $("#collection-name-input").val();
        var description = $("#collection-description-input").val();
        var image = $("#imageInput")[0].files[0];
        var formData = new FormData();
        formData.append("name", name);
        formData.append("description", description);
        formData.append("image", image);
        $.ajax({
            url: "/api/collections/add",
            type: "POST",
            data: formData,
            contentType: false,
            processData: false,
            success: function(data){
                window.location.href = "/collections";
            }
        });
    });
});