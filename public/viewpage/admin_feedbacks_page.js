import * as Element from "./element.js";
import * as Routes from "../controller/routes.js";
import * as Auth from "../controller/auth.js";
import * as Util from "./util.js";
import * as FirebaseController from "../controller/firebase_controller.js";
import * as Constant from "../model/constant.js";

export function addEventListeners(){
    Element.menuButtonFeedbacks.addEventListener("click", async () => {
        history.pushState(null, null,Routes.routePathname.ADMINFEEDBACKS);
        const button = Element.menuButtonFeedbacks;
        const label = Util.disableButton(button);
        await feedback_page();
        Util.enableButton(button,label);
    });
}

export async function feedback_page(){
    let html = `<h1>User Feedbacks </h1>`;

    // get all reviews from Firebase
    const feedbacks = await FirebaseController.getFeedbacks();    

    //display reviews
    if(feedbacks.length === 0){
        html = "No feedbacks from users at the moment";
    }
    else {
        html += `
                <table class="table table-striped ">
                <tr>
                    <td>
                        <form id="admin-form-search-feedback">
                            <input name="searchFeedback" class="form-control" type="search" placeholder="Search a product" 
                            aria-label="Search">
                            <button class="btn btn-outline-success" type="submit">Search</button>
                        </form>
                    </td>    
                </tr>
                <thead>
                    <tr>
                        <th scope="col"></th>
                        <th scope="col">Name</th>
                        <th scope="col">Opinion</th>
                        <th scope="col">Time</th>
                        <th scope="col">User</th>
                    </tr>
                </thead>
                <tbody>
        `

        feedbacks.forEach(comment => {
           html +=  buildFeedBack(comment);
        });

        html += "</tbody></table>";
    }

    Element.mainContent.innerHTML = html;

    // delete feedback
    const adminDeleteFeedBackForms = document.getElementsByClassName("admin-form-delete-feedback");
    for(let i=0; i < adminDeleteFeedBackForms.length; i++){
        adminDeleteFeedBackForms[i].addEventListener("submit", async (e) => {
            e.preventDefault();
            //confirm
            const r = confirm("Are you sure to delete this feedback?");
            if(!r) return;

            //Disable button
            const button = e.target.getElementsByTagName("button")[0];
            Util.disableButton(button);

            const reviewId = e.target.reviewId.value;
            try {
                await FirebaseController.deleteReviewById(reviewId);
                await feedback_page();
                Util.popupInfo("Deleted ", `feedback ${reviewId} deleted`);
            } catch (e) {
                if (Constant.DEV) console.log(e);
                Util.popupInfo("Delete feedback  error", JSON.stringify(e));
            } 
        });
    }

     //search user by name
     const AdminformSearchFeedBack = document.getElementById("admin-form-search-feedback");
     AdminformSearchFeedBack.addEventListener("submit", async (e) => {
         e.preventDefault();
         const searchProductButton = AdminformSearchFeedBack.getElementsByTagName("button")[0];
         const label = Util.disableButton(searchProductButton);
         const searchProduct = e.target.searchFeedback.value.trim();
         if (searchProduct.length == 0){
             Util.popupInfo("No product specified", "Enter a product name to search");
             Util.enableButton(searchProductButton, label);
             return 
         }    
         search_feedback_product(searchProduct);
         e.target.searchFeedback.value = "";
         Util.enableButton(searchProductButton, label);  
     });
}

function buildFeedBack(comment){
    let format = `
                <tr >
                    <td> <img src= "${comment.imageURL}" > </td>
                    <td> ${comment.productName} </td>
                    <td> ${comment.review} </td>
                    <td> ${ new Date(comment.timestamp).toString() }</td>
                    <td> ${comment.userName } </td>
                    <td>
                        <form class="admin-form-delete-feedback float-left" method="post">
                            <input type="hidden" name="reviewId" value="${comment.docId}">
                            <button class="btn btn-danger" type="submit"> Delete </button>
                        </form>
                    </td>
                </tr>
    `;
    return format;
}

async function search_feedback_product(searchProduct){
    let html;
    if (!Auth.currentUser){
        Element.mainContent.innerHTML = "<h1>Protected Page</h1>"
        return
    }
    
    try{
        // Perform a search from database
        const result = await FirebaseController.searchFeedBackProduct(searchProduct);
        buildFeedBackResultPage(result);
    }
    catch(e){
        if (Constant.DEV) console.log(e);
        return;
    }
}

function buildFeedBackResultPage(result){
    let html = `
        <table class="table table-striped ">
        <thead>
            <tr>
                <th scope="col"></th>
                <th scope="col">Name</th>
                <th scope="col">Opinion</th>
                <th scope="col">Time</th>
                <th scope="col">User</th>
            </tr>
        </thead>
        <tbody>
    `
    result.forEach(user => {
        html += buildFeedBack(user);
    });

    Element.mainContent.innerHTML = html;


    // delete feedback
    const adminDeleteFeedBackForms = document.getElementsByClassName("admin-form-delete-feedback");
    for(let i=0; i < adminDeleteFeedBackForms.length; i++){
        adminDeleteFeedBackForms[i].addEventListener("submit", async (e) => {
            e.preventDefault();
            //confirm
            const r = confirm("Are you sure to delete this feedback?");
            if(!r) return;

            //Disable button
            const button = e.target.getElementsByTagName("button")[0];
            Util.disableButton(button);

            const reviewId = e.target.reviewId.value;
            try {
                await FirebaseController.deleteReviewById(reviewId);
                await feedback_page();
                Util.popupInfo("Deleted ", `feedback ${reviewId} deleted`);
            } catch (e) {
                if (Constant.DEV) console.log(e);
                Util.popupInfo("Delete feedback  error", JSON.stringify(e));
            } 
        });
    }
}

   