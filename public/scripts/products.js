
$(document).ready(function(){


    // pop up 
    $(".three-dots-product-option").click(popupClick);

    $(document).click(closePopup);

    // add product form
    $('.grid-header-add-button').on('click', function() {
        clearForm();
        $('.add-product-modal').fadeIn();
    });

    $(".main-picture").click(function(event){
        $("#imageInput").click();
    });


    $('.exit-form').on('click', function() {
        // clear form
        clearForm();

        $('.add-product-modal').fadeOut();

    });
    
    $("#imageInput").change(displayUploadedImage);

    $("#imageInput").click(function(event){ event.stopPropagation();    });

    $('#material-input').keydown(listenToTagEntry);

    $('#product-name-input').on('keyup', validateProductName);

    $('#product-price-input').on('keyup', validatePriceInput);

    $('#product-sku-input').on('keyup', validateSKUInput);

    $("#next-form-button").click(toForm2Click);

    $(".add-row-button").click(addVariation);

    $("#back-form-button").click(toForm1Click);

    $(".product-form-stock").on('keyup', validateStockInput);

    $(document).on('input', '.product-form-stock', validateStockInput); // bind the dynamically added stuff



    $(".product-form-manucost").on('keyup', validatePriceInput);

    $(document).on('input', '.product-form-manucost', validatePriceInput); // bind the dynamically added stuff
    
    // edit product form
    $(".edit-product").click(editProduct);



    // delete product
    $(".delete-product").click(deleteProduct);

    // delete row in form
    $('.delete-row-icon').each(deleteRow);
    

});