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
    console.log(adminCarts);
}
