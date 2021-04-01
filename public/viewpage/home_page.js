import * as Element from "./element.js";
import * as Routes from "../controller/routes.js";
import * as FirebaseController from "../controller/firebase_controller.js";
import * as Constant from "../model/constant.js";
import * as Util from "./util.js";
import { Product } from "../model/product.js";


export async function addEventListeners(){
    Element.menuButtonHome.addEventListener("click",  ()=>{
        history.pushState(null, null,Routes.routePathname.HOME);
        home_page();
    });
}



export async function home_page(){   
    let products;
    let html = "<h1> Welcome </h1>";
       
     try{
        products = await FirebaseController.getProductList();
        
         products.forEach( product => {
             html += buildProductCard(product);
         });
    }
    catch(e){
         if(Constant.DEV) console.log(e);
         Util.popupInfo("getProductList Error", JSON.stringify(e));
         return;
    }
    Element.mainContent.innerHTML = html; 
}

//Display product information
function buildProductCard(product){
   return `
            <div class="card" style="width: 18rem; display:inline-block; ">
                <img src="${product.imageURL}" class="card-img-top " >
                <div class="card-body mx-2 ">
                    <h5 class="card-title">${product.name}</h5>
                    <p class="card-text">
                        ${Util.currency(product.price) } <br>
                        ${product.summary}
                    </p>        
                </div>
            </div>
  ` 
}