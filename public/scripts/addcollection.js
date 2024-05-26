$(document).ready(function(){
    $(".main-picture").click(function(event){
        // event.stopPropagation();
        // console.log("clicked");
        $("#imageInput").click();
    });

    $("#imageInput").click(function(event){
        event.stopPropagation();
    });

 
    
    $("#imageInput").change(function(event){
        var file = this.files[0];
        var reader = new FileReader();
        
        mediaContainer = $(".main-picture")
        reader.onload = function(e){
            const photoContainer = document.createElement('div');
            photoContainer.className = 'collection-photo-container';

            const img = document.createElement('img');
            img.src = e.target.result;
            img.className = 'collection-photo';
            photoContainer.appendChild(img);

            mediaContainer.append(photoContainer);

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
        formData.append("collectionPicture", image);
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