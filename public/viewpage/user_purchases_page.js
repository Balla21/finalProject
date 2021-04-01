import * as Element from "./element.js";
import * as Auth from "../controller/auth.js";
import * as Routes from "../controller/routes.js";
import * as FirebaseController from "../controller/firebase_controller.js";
import * as Constant from "../model/constant.js";
import * as Util from "./util.js";
import * as Review from "../controller/user_review_product_page.js";

export function addEventListeners(){
    Element.menuButtonPurchases.addEventListener("click", ()=>{
        history.pushState(null, null, Routes.routePathname.USERPURCHASES);
        user_purchases_page();
    });
}

let carts = [];
export async function user_purchases_page(){
    if(!Auth.currentUser){
        Element.mainContent.innerHTML = "<h1>Protected Page </h1>";
        return;
    }

    //Get purchase history
    try{
        carts = await FirebaseController.getPurchaseHistory(Auth.currentUser.uid);
        if(!carts || carts.length == 0 ){
            Element.mainContent.innerHTML = "<h1> No Purchase </h1>";
            return ;
        }
    }
    catch(e){
        if(Constant.DEV) console.log(e);
        Util.popupInfo("Purchase History error", JSON.stringify(e));
        return;
    }
   let html = `<h1> Purchase History </h1>`;

   html += `
        <table class="table table-striped">
            <tbody>  
   `;

    for(let index = 0; index < carts.length ; index++){
        html += `
            <tr> 
                <td> 
                    <form class="purchase-history" method="post" >
                        <input type="hidden" name="index" value="${index}">
                        <button class="btn btn-outline-secondary" type="submit"> 
                            ${ new Date(carts[index].timestamp).toString() }
                        </button>
                    </form>
                </td>
            </tr>
        `
    }

    html += `</tbody></table>`;
    Element.mainContent.innerHTML = html;

    //history event listener
    const historyForms = document.getElementsByClassName("purchase-history");
    for(let i=0; i < historyForms.length ; i++){
        historyForms[i].addEventListener("submit", async (e) => {
            e.preventDefault()
            const index = e.target.index.value;
            Element.modalTransactionTitle.innerHTML = `Purchased At: ${ new Date(carts[index].timestamp).toString() }` ;
            Element.modalTransactionBody.innerHTML = buildTransactionDetails( carts[index] );

             //Review button addEventLister
            const reviewButtons = document.getElementsByClassName("form-review-product");
            for(let i = 0; i < reviewButtons.length; i++){
                reviewButtons[i].addEventListener("submit", async (e) => {
                    e.preventDefault();
                    const button = e.target.getElementsByTagName("button")[0];
                    const label = Util.disableButton(button);
                    await Review.review_product(e.target.docId.value)
                    Util.enableButton(button, label);
                    $('#modal-transaction').modal('hide')
                });
            }

            //display list of all transaction
            $("#modal-transaction").modal("show");
        });
    }
}


//Transaction card details 
function buildTransactionDetails(cart){
    let html = `
        <table class="table table-striped">
            <thead>
            <tr>
                <th scope="col"> Image </th>
                <th scope="col"> Name </th>
                <th scope="col"> Price </th>
                <th scope="col"> Qty </th>
                <th scope="col"> Subtotal </th>
                <th scope="col" width="50"> Summary </th>
            </tr>
            </thead>
            <tbody>
    `;
    cart.items.forEach(item => {
        html += `
            <tr> 
                
                <td><img src="${item.imageURL}" width="150px"> </td>
                <td> ${item.name}  </td>
                <td> ${ Util.currency(item.price) }  </td>
                <td> ${item.qty}  </td>
                <td> ${ Util.currency(item.qty * item.price) }  </td>
                <td> ${item.summary}  </td>
                
                <td> 
                    <form class="form-review-product" method="post">
                        <input type="hidden" name="docId" value="${item.docId}">
                        <button class="btn btn-outline-primary" type="submit"> Review </button>
                    </form>
                </td>
            </tr>
        `
     });
     html += `</tbody></table>`;
     html += `<div style="font-size: 150%;" >Total : ${cart.getTotalPrice()} </div>`;

     return html;
}