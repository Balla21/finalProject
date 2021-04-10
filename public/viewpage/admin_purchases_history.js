import * as Element from "./element.js";
import * as Auth from "../controller/auth.js";
import * as Routes from "../controller/routes.js";
import * as FirebaseController from "../controller/firebase_controller.js";
import * as Constant from "../model/constant.js";
import * as Util from "./util.js";
import * as Review from "../controller/user_review_product_page.js";

export function addEventListeners(){
    Element.menuButtonPurchasesHistory.addEventListener("click", async ()=>{
        history.pushState(null, null, Routes.routePathname.ADMINPURCHASESHISTORY);
        const button = Element.menuButtonPurchasesHistory;
        const label = Util.disableButton(button);
        await admin_purchases_page();
        Util.enableButton(button,label);
    });
}


let adminCarts = [];
export async function admin_purchases_page(){
    if(!Auth.currentUser){
        Element.mainContent.innerHTML = "<h1>Protected Page </h1>";
        return;
    }
    //Get purchase history
    try{
        adminCarts = await FirebaseController.getPurchaseHistoryList();
        if(!adminCarts || adminCarts.length == 0 ){
            Element.mainContent.innerHTML = "<h1> No Purchase </h1>";
            return ;
        }
    }
    catch(e){
        if(Constant.DEV) console.log(e);
        Util.popupInfo("Purchase History error", JSON.stringify(e));
        return;
    }

    

    //display all purchases
    let html = `<h1> All Purchases from the Online store </h1>`;

    html += `
         <table class="table table-striped">
             <tbody>  
    `;
     for(let index = 0; index < adminCarts.length ; index++){
         html += `
             <tr> 
                 <td> 
                     <form class="admin-purchase-history" method="post" >
                         <input type="hidden" name="index" value="${index}">
                         <button class="btn btn-outline-secondary" type="submit"> 
                             ${ new Date(adminCarts[index].uid.timestamp).toString() }
                         </button>
                     </form>
                 </td>
             </tr>
         `
     }
     html += `</tbody></table>`;
     console.log(adminCarts[0]);
     Element.mainContent.innerHTML = html;

    //history event listener
    const adminHistoryForms = document.getElementsByClassName("admin-purchase-history");
    for(let i=0; i < adminHistoryForms.length ; i++){
        adminHistoryForms[i].addEventListener("submit", async (e) => {
            e.preventDefault()
            const index = e.target.index.value;
            Element.modalTransactionTitle.innerHTML = `Purchased At: ${ new Date(adminCarts[index].uid.timestamp).toString() }` ;
            Element.modalTransactionBody.innerHTML = buildTransactionDetails( adminCarts[index] );

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
    cart.uid.items.forEach(item => {
        html += `
            <tr> 
                
                <td><img src="${item.imageURL}" width="150px"> </td>
                <td> ${item.name}  </td>
                <td> ${ Util.currency(item.price) }  </td>
                <td> ${item.qty}  </td>
                <td> ${ Util.currency(item.qty * item.price) }  </td>
                <td> ${item.summary}  </td>
            </tr>
        `
     });
     html += `</tbody></table>`;
     html += `<div style="font-size: 150%;" >Total : ${Util.currency(cart.getTotalPrice())} </div>`;

     return html;
}   
