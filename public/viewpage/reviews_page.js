import * as Element from "./element.js";
import * as Routes from "../controller/routes.js";
import * as Auth from "../controller/auth.js";
import * as Util from "./util.js";
import * as FirebaseController from "../controller/firebase_controller.js";
import * as Constant from "../model/constant.js";




export function addEventListeners(){
    Element.menuButtonReviews.addEventListener("click", () => {
        history.pushState(null, null,Routes.routePathname.REVIEWS);
        review_page();
    });
}

export async function review_page(){
    let html = `<h1>Product Reviews </h1>`;

    // get all reviews from Firebase
    const comments = await FirebaseController.getReviewsList();

    //display reviews
    if(comments.length === 0){
        html = "No reviews at the moment";
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
                        <th scope="col">user</th>
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


}

function buildReviewInfo(comment){
    let format = `
                <tr>
                    <td> <img src= "${comment.imageURL}" > </td>
                    <td> ${comment.productName} </td>
                    <td> ${comment.review} </td>
                    <td> ${ new Date(comment.timestamp).toString() }</td>
                    <td> ${comment.userName } </td>
                </tr>
    `;
    return format;
}


   