import * as FirebaseController from "./firebase_controller.js";
import * as Constant from "../model/constant.js"; 
import * as Util from "../viewpage/util.js";
import * as Element from "../viewpage/element.js";
import { Comment } from "../model/comments.js";

import * as UserReviewPage from "../viewpage/user_reviews_page.js";

export function addEventListeners(){
   
    //Update the product
    Element.formEditReview.addEventListener("submit", async (e) =>{
        e.preventDefault();
       Element.formEditReviewError.reviewCommentError.innerHTML = "";
        const button = e.target.getElementsByTagName("button")[0];
        const label = Util.disableButton(button);
        const com = new Comment({
            review: e.target.editReview.value,
            timestamp: Date.now(),
        });

        com.docId = e.target.reviewId.value;

        const reviewErrors = com.validate();

    if(reviewErrors){
        if (reviewErrors.review) Element.formEditReviewError.reviewCommentError.innerHTML = reviewErrors.review;
    }
    else {
        try{
            //update Firestore
            await FirebaseController.updateReview(com);
            Util.popupInfo("updated!",  `${com.docId} is updated successfully`, "modal-edit-review");

            //refresh browser
            UserReviewPage.user_review_page();
            
        }
        catch(e){
            if(Constant.DEV) console.log(e);
            Util.popupInfo("Edit Review Failed" ,JSON.stringify(e), "modal-edit-review");
        }
    }
        


        Util.enableButton(button, label);
    });
}

export async function edit_review(reviewId){
    //Get info to the modal form of Edit review
    let review; 
    try{
        review = await FirebaseController.getReviewById(reviewId);
        if(!review){ 
            Util.popupInfo("getReviewById error", `No review found by Id ${reviewId}`);
            return
        } 
    }
    catch(e){
        if(Constant.DEV) console.log(e);
        Util.popupInfo("getReviewById error", JSON.stringify(e));
    }
        

    //Get info to the modal form of Edit Product
    Element.formEditReview.reviewId.value = review.docId;
    Element.formEditReviewImageTag.src = review.imageURL;
    Element.formEditReview.name.value =  review.productName;
    Element.formEditReview.editReview.value = review.review;

    

    
    
$("#modal-edit-review").modal("show");
    
    

}