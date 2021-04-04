import * as Element from "./element.js";
import * as Routes from "../controller/routes.js";
import * as Auth from "../controller/auth.js";
import * as Util from "./util.js";
import * as FirebaseController from "../controller/firebase_controller.js";
import * as Constant from "../model/constant.js";
import * as UserEditReview from "../controller/user_edit_review_page.js";





export function addEventListeners(){
    Element.menuButtonUserReviews.addEventListener("click", () => {
        history.pushState(null, null,Routes.routePathname.USERREVIEWS);
        user_review_page();
    });
}

export async function user_review_page(){
    let html = `<h1>Product Reviews from ${Auth.currentUser.email}</h1>`;

    // get all reviews from Firebase
    const comments = await FirebaseController.getReviewsListByUser(Auth.currentUser.uid);

    //display reviews
    if(comments.length === 0){
        html = "No reviews from this User";
    }
    else {
        html += `
                <table class="table table-striped ">
                <thead>
                    <tr>
                        <th scope="col"></th>
                        <th scope="col">Name</th>
                        <th scope="col">review</th>
                        <th scope="col">time</th>
                    </tr>
                </thead>
                <tbody>
        `

        comments.forEach(comment => {
           html +=  buildReviewInfo(comment);
        });

        html += "</tbody></table>";
    }

    Element.mainContent.innerHTML = html;


    //Delete review button add Event listener
    const deleteReviewForms = document.getElementsByClassName("form-delete-review");
    for(let i=0; i < deleteReviewForms.length; i++){
        deleteReviewForms[i].addEventListener("submit", async (e) => {
            e.preventDefault();
            //confirm
            const r = confirm("Are you sure to delete this review?");
            if(!r) return;

            //Disable button
            const button = e.target.getElementsByTagName("button")[0];
            Util.disableButton(button);

            const reviewId = e.target.reviewId.value;
            try {
                await FirebaseController.deleteReviewById(reviewId);
                //remove review from  browser
                document.getElementById(`review-${reviewId}`).remove();
                Util.popupInfo("Deleted ", `review deleted: review-${reviewId}`);
            } catch (e) {
                if (Constant.DEV) console.log(e);
                Util.popupInfo("Delete review  error", JSON.stringify(e));
            } 
        });
    }

    //Edit review button
     const editReviewButtons = document.getElementsByClassName("form-edit-review");
     for(let i = 0; i < editReviewButtons.length; i++){
        editReviewButtons[i].addEventListener("submit", async (e) => {
             e.preventDefault();
             
             const button = e.target.getElementsByTagName("button")[0];
             const label = Util.disableButton(button);
             // Edit feature
                //await Edit.edit_product(e.target.docId.value);
                await UserEditReview.edit_review(e.target.reviewId.value)

             //Edit feature
             Util.enableButton(button, label);
         });
     }


}

function buildReviewInfo(comment){
    let format = `
        <tr id="review-${comment.docId}">
            <td> <img src= "${comment.imageURL}" > </td>
            <td> ${comment.productName} </td>
            <td> ${comment.review} </td>
            <td> ${ new Date(comment.timestamp).toString() }</td>
        
            <td>
                <form class="form-delete-review float-left" method="post">
                    <input type="hidden" name="reviewId" value="${comment.docId}">
                    <button class="btn btn-danger" type="submit"> Delete </button>
                </form>
                <form class="form-edit-review float-right" method="post">
                    <input type="hidden" name="reviewId" value="${comment.docId}">
                    <button class="btn btn-warning" type="submit"> Edit </button>
                </form>
            <td>
        </tr>
    `;
    return format;
}


   