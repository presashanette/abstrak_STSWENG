
let tagList = [];
let name, price, sku, materials;

function popupClick(event){
    event.stopPropagation(); // do not bubble up to the DOM window
    var $popup = $(this).closest('.container').find('.product-options-popup');
    $(".product-options-popup").not($popup).hide(); 
    $popup.toggle(); 
}

function closePopup(event){
    if (!$(event.target).closest('.product-options-popup').length && !$(event.target).hasClass('three-dots-product-option')) {
        $(".product-options-popup").hide();
    }
}

function displayUploadedImage(event) {

    var file = this.files[0];
    var reader = new FileReader();
    
    mediaContainer = $(".main-picture")
    reader.onload = function(e){
        const photoContainer = document.createElement('div');
        photoContainer.className = 'product-photo-container';

        const img = document.createElement('img');
        img.src = e.target.result;
        img.className = 'product-photo';
        photoContainer.appendChild(img);

        mediaContainer.append(photoContainer);
    }
    reader.readAsDataURL(file);
}


function listenToTagEntry(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        var tag = $(this).val().trim();
        if (tag) {
            addTag(tag);
            $(this).val('');
        }
    }
}

function addTag(tag) {
    if (tagList.includes(tag)) {
        console.log('Tag already exists:', tag);
        return;
    }

    tagList.push(tag);

    var tagElement = $('<div>').addClass('material').text(tag);
    var removeButton = $('<span>').addClass('remove-material').text('×').click(function() {
        var index = tagList.indexOf(tag);
        if (index !== -1) {
            tagList.splice(index, 1);
        }
        $(this).parent().remove();
    });
    tagElement.append(removeButton);
    $('#material-list').append(tagElement);
}

function validateProductName() {
    const name = $(this).val();

    if (name === ""){
        $('#product-name-input').removeClass('correct-input').addClass('wrong-input');
    } else {
        $.ajax({
            url: '/api/products/check-name',
            type: 'POST',
            data: {
                name: name
            },
            success: function(data) {
                if(data.success){
                    $('#product-name-input').removeClass('wrong-input').addClass('correct-input');
                } else {
                    $('#product-name-input').addClass('wrong-input');
                }
            }
        });
    }
}

function validatePriceInput() {
    if(Number($(this).val()) > 0) {
        $('#product-price-input').removeClass('wrong-input').addClass('correct-input');
    } else {
        $('#product-price-input').removeClass('correct-input').addClass('wrong-input');
    }
}


function validateSKUInput() {
    if($(this).val() === "") {
        $('#product-sku-input').removeClass('correct-input').addClass('wrong-input');
    } else {
        $.ajax({
            url: '/api/products/check-sku',
            type: 'POST',
            data: {
                sku: $(this).val()
            },
            success: function(data) {
                if(data.success){
                    $('#product-sku-input').removeClass('wrong-input').addClass('correct-input');
                } else {
                    $('#product-sku-input').addClass('wrong-input');
                }
            }
        });
    }
}


function deleteProduct(){
        event.preventDefault();
        const $container = $(this).closest('.container');
        const deleteProductId = $container.data('id');
        const productName = $container.data('name');
        const productPicture = $container.data('picture');
    
        Swal.fire({
            title: 'Are you sure?',
            html: `<p>Do you want to delete the product "<strong>${productName}</strong>"?</p><img src="${productPicture}" alt="${productName}" class="swal-product-image">`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'No, keep it'
        }).then((result) => {
            if (result.isConfirmed) {
                Swal.fire({
                    title: 'Delete associated details?',
                    html: `<p>Do you also want to delete the associated details for "<strong>${productName}</strong>"?</p><img src="${productPicture}" alt="${productName}" class="swal-product-image">`,
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#d33',
                    confirmButtonText: 'Yes, delete associations',
                    cancelButtonText: 'No, keep associations'
                }).then((assocResult) => {
                    if (assocResult.isConfirmed) {
                        $.ajax({
                            url: '/api/products/delete/' + deleteProductId + '?deleteAssociations=true',
                            type: 'DELETE',
                            success: function(result) {
                                Swal.fire(
                                    'Deleted!',
                                    `Product "<strong>${productName}</strong>" and associations have been deleted.`,
                                    'success'
                                ).then(() => location.reload());
                            },
                            error: function(err) {
                                Swal.fire('Error', 'Error deleting product.', 'error');
                            }
                        });
                    } else if (assocResult.dismiss === Swal.DismissReason.cancel) {
                        $.ajax({
                            url: '/api/products/delete/' + deleteProductId + '?deleteAssociations=false',
                            type: 'DELETE',
                            success: function(result) {
                                Swal.fire(
                                    'Deleted!',
                                    `Product "<strong>${productName}</strong>" has been deleted, associations retained.`,
                                    'success'
                                ).then(() => location.reload());
                            },
                            error: function(err) {
                                Swal.fire('Error', 'Error deleting product.', 'error');
                            }
                        });
                    }
                });
            }
        });
}

function nextForm(event){
    event.preventDefault();
    name = $('#product-name-input').val();
    price = $('#product-price-input').val();
    sku = $('#product-sku-input').val();
    materials = tagList;

    if(name === "" || price === "" || sku === "" || materials.length === 0){
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Please fill out all fields!',
        })
        return;
    }

    $(".form-1").hide();
    $(".form-2").show();
    $("#next-form-button").text("Submit");
    $("#back-form-button").show();
}

function submitProduct(event){
    event.preventDefault();

    const product = {
        name: name,
        price: price,
        sku: sku,
        materials: materials,
        variations: []
    };

    const variations = $('.add-product-variation-row');
    let isValid = true;

    for (let i = 0; i < variations.length; i++) {
        const variation = {};
        variation.name = $(variations[i]).find('.product-variation').val();
        variation.size = $(variations[i]).find('.product-size').val();
        variation.manuCost = $(variations[i]).find('.product-manu-cost').val();

        if (!variation.name || !variation.manuCost) {
            isValid = false;
            break;
        }

        product.variations.push(variation);

    }

    if(!isValid){
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Please fill out all fields!',
        })
        return;
    }

    console.log(product);   
}

function toForm1Click(event){
    $(".form-1").show();
    $(".form-2").hide();
    $("#next-form-button").text("Next");
    $("#back-form-button").hide();
}

function toForm2Click(event){
    
    $("#next-form-button").text() === "Submit" ? submitProduct(event) : nextForm(event);    


}



function addVariation() {
    var newVariationRow = $('.add-product-variation-row:first').clone();
    newVariationRow.find('input').val('');
    $('.add-row-frame').append(newVariationRow);
}
