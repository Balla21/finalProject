import * as FirebaseController from "./firebase_controller.js";
import * as Constant from "../model/constant.js"; 
import * as Util from "../viewpage/util.js";
import * as Element from "../viewpage/element.js";
import { Product } from "../model/product.js";
import { Comment } from "../model/comments.js";
import * as Auth from "./auth.js";

//Image event modification
export function addEventListeners(){
    //post comment
    Element.formReviewProduct.addEventListener("submit", async (e) => {
        e.preventDefault();
        const button = e.target.getElementsByTagName("button")[0];
        const label = Util.disableButton(button);
        await addReview(e, e.target.name.value, Element.formReviewImageTag.src);
        Util.enableButton(button, label);

    });
    

}

export async function review_product(docId){
    

    let product; 
    try{
        product = await FirebaseController.userGetProductById(docId);
        if(!product){ 
            Util.popupInfo("getProductById error", `No product found by Id ${docId}`);
            return
        } 
    }
    catch(e){
        if(Constant.DEV) console.log(e);
        Util.popupInfo("getProductById error", JSON.stringify(e));
    }

     //Upload product information
     Element.formReviewImageTag.src = product.imageURL;
     Element.formReviewProduct.docId.value = product.docId;
     Element.formReviewProduct.name.value = product.name;
     Element.formReviewProduct.price.value = product.price;

     //Reset field
    Element.formReviewProduct.review.value = "";
     


    $("#modal-review-product").modal("show");
    
}

async function addReview(e, prodName, productImage){
    const comment = new Comment({
        review: e.target.review.value, 
        timestamp: Date.now(),
        userId: Auth.currentUser.uid,
        productId: e.target.docId.value,
        productName: prodName,
        imageURL: productImage,
        userName: Auth.currentUser.email,
    });


    const reviewErrors = comment.validate();

    if(reviewErrors){
        if (reviewErrors.review) Element.formReviewProductError.reviewCommentError.innerHTML = reviewErrors.review;
    }
    else {
        try{
            await FirebaseController.addReview( comment.serialize() );

            Util.popupInfo("Success",` Your review on ${prodName} has been added `, "modal-review-product");
        }
        catch(e){
            if(Constant.DEV) console.log(e);
            Util.popupInfo("Add product Failed" ,JSON.stringify(e), "modal-review-product");
        }
    }

}
