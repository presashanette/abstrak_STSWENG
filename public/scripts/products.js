
$(document).ready(function(){


    // pop up 
    $(".three-dots-product-option").click(popupClick);

    $(document).click(closePopup);

    // add product form
    $('.grid-header-add-button').on('click', function() {
        $('.add-product-modal').fadeIn();
    });

    $(".main-picture").click(function(event){
        $("#imageInput").click();
    });


    $('.exit-form').on('click', function() {
        $('.add-product-modal').fadeOut();
    });
    
    $("#imageInput").change(displayUploadedImage);

    $("#imageInput").click(function(event){ event.stopPropagation();    });

    $('#material-input').keydown(listenToTagEntry);

    $('#product-name-input').on('keyup', validateProductName);

    $('#product-price-input').on('keyup', validatePriceInput);

    $('#product-sku-input').on('keyup', validateSKUInput);
    
    $(".to-product-form2-button").click(toForm2Click);


    
    // edit product form
    $('.edit-product').on('click', function() {
        $('.edit-product-modal').fadeIn();
    });


    $('.edit-exit-form').on('click', function() {
        $('.edit-product-modal').fadeOut();
    });

    $(".edit-main-picture").click(function(event){
        $("#edit-imageInput").click();
    });

    $("#edit-imageInput").click(function(event){
        event.stopPropagation();
    });



    // delete product
    $(".delete-product").click(deleteProduct);


});