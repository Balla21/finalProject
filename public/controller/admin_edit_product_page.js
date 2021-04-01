import * as FirebaseController from "./firebase_controller.js";
import * as Constant from "../model/constant.js"; 
import * as Util from "../viewpage/util.js";
import * as Element from "../viewpage/element.js";
import { Product } from "../model/product.js";

let imageFile2Upload 
//Image event modification
export function addEventListeners(){
    Element.formEditImageFileButton.addEventListener("change", (e) => {
        imageFile2Upload = e.target.files[0];
        if(!imageFile2Upload) return 
        const reader = new FileReader();
        reader.onload = () => Element.formEditImageTag.src = reader.result;
        reader.readAsDataURL(imageFile2Upload);
    });


    //Update the product
    Element.formEditProduct.addEventListener("submit", async (e) =>{
        e.preventDefault();
        const button = e.target.getElementsByTagName("button")[0];
        const label = Util.disableButton(button);
        const p = new Product({
            name: e.target.name.value,
            price: e.target.price.value,
            summary: e.target.summary.value,

        });

        p.docId = e.target.docId.value;

        //reset input validation paragraph
        const errorTags = document.getElementsByClassName("error-add-product");
        for(let i=0; i < errorTags.length; i++){
            errorTags[i].innerHTML = "";
        }

        //Validate input from modal edit
        const errors = p.validate(true);
        if(errors){
            if(errors.name){
                Element.formEditProductError.name.innerHTML = errors.name;
            }
            if(errors.price){
                Element.formEditProductError.price.innerHTML = errors.price;
            }
            if(errors.summary){
                Element.formEditProductError.price.innerHTML = errors.summary;
            }
            Util.enableButton(button, label);
            return;
        }

        //upload images
        try{
            if(imageFile2Upload){
                const imageInfo = await FirebaseController.uploadImage(imageFile2Upload, e.target.imageName.value);
                p.imageURL = imageInfo.imageURL
            }

            //update Firestore
            await FirebaseController.updateProduct(p);

            //Update the web browser
            const cardTag = document.getElementById("card-"+p.docId);
            if(imageFile2Upload){
                cardTag.getElementsByTagName("img")[0].src = p.imageURL;   
            }
            cardTag.getElementsByClassName("card-title")[0].innerHTML = p.name;
            cardTag.getElementsByClassName("card-text")[0].innerHTML = `$ ${p.price} <br> ${p.summary} `;
            


            Util.popupInfo("updated!",  `${p.name} is updated successfully`, "modal-edit-product");
        }catch(e){
            if (Constant.DEV) console.log(e);
            Util.popupInfo("Update Product error ", JSON.stringify(e), "modal-edit-product");
        }

        Util.enableButton(button, label);
    });
}

export async function edit_product(docId){
    let product; 
    try{
        product = await FirebaseController.getProductById(docId);
        if(!product){ 
            Util.popupInfo("getProductById error", `No product found by Id ${docId}`);
            return
        } 
    }
    catch(e){
        if(Constant.DEV) console.log(e);
        Util.popupInfo("getProductById error", JSON.stringify(e));
    }

    //Get info to the modal form of Edit Product
        Element.formEditProduct.docId.value = product.docId;
        Element.formEditProduct.name.value = product.name;
        Element.formEditProduct.price.value = product.price;
        Element.formEditProduct.summary.value = product.summary;
        Element.formEditProduct.imageName.value = product.imageName;
        Element.formEditImageTag.src = product.imageURL;
        imageFile2Upload = null;

    $("#modal-edit-product").modal("show");
    
    

}

export async function delete_product(docId, imageName){
    try{
        await FirebaseController.deleteProduct(docId, imageName);
        //Update webpage
        const card = document.getElementById(`card-${docId}`);
        card.remove();
        Util.popupInfo("Deleted!", `${docId} has been successfully deleted`)
    }
    catch(e){
        if(Constant.DEV) console.log(e);
        Util.popupInfo("Delete Error", JSON.stringify(e));
    }
}