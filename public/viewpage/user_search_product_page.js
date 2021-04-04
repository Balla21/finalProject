import * as Element from "./element.js";
import * as Routes from "../controller/routes.js";
import * as Auth from "../controller/auth.js";
import * as Util from "./util.js";
import * as FirebaseController from "../controller/firebase_controller.js";
import * as Constant from "../model/constant.js";
import * as UserPage from "./user_page.js";
import { ShoppingCart } from "../model/shoppingcart.js";
import { Product } from "../model/product.js";

let cart
let productList;

export function addEventListeners(){
    Element.formSearch.addEventListener("submit", async (e) => {
        e.preventDefault();
        const searchButton = Element.formSearch.getElementsByTagName("button")[0];
        const label = Util.disableButton(searchButton);
        const searchKeyword = e.target.searchKeyword.value;
        if (searchKeyword.length == 0){
            Util.popupInfo("No search specified", "Enter a word to search");
            return 
        }
        search_page(searchKeyword);
        Util.enableButton(searchButton, label);
    });

}

export async function search_page(searchKeyword){
    if (!Auth.currentUser){
        Element.mainContent.innerHTML = "<h1>Protected Page</h1>"
        return
    }
    
    try{
        // Perform a search from database
        productList = await FirebaseController.searchProduct(searchKeyword);
        if (cart && cart.items){
            cart.items.forEach(item => {
                const product = productList.find(p => {
                    return item.docId == p.docId;
                })
                console.log(item.qty);
                product.qty = item.qty;
            })
        }
    }
    catch(e){
        if (Constant.DEV) console.log(e);
        return;
    }
    
    buildSearchPage(productList);

    
    history.pushState(null, null, Routes.routePathname.SEARCH + "#" + searchKeyword );

      // + button add event listener
    const plusForms = document.getElementsByClassName("form-increase-qty");
    for(let i =0; i <plusForms.length; i++){
        plusForms[i].addEventListener("submit", (e) => {
            e.preventDefault();
            const p = productList[e.target.index.value];
            cart.addItem(p);
            document.getElementById(`qty-${p.docId}`).innerHTML = p.qty;
            Element.shoppingcartCount.innerHTML = cart.getTotalQty();
        });
    }

     // - button add event listener
     const minusForms = document.getElementsByClassName("form-decrease-qty");
     for(let i =0; i <minusForms.length; i++){
         minusForms[i].addEventListener("submit", (e) => {
             e.preventDefault();
             const p = productList[e.target.index.value];
             cart.removeItem(p);
             document.getElementById(`qty-${p.docId}`).innerHTML = ( p.qty == null || p.qty == 0 ) ? "Add" : p.qty;
             Element.shoppingcartCount.innerHTML = cart.getTotalQty();
         });
     }
}

//build search product page
export function buildSearchPage(productList){
    // product quantity
    let html = "";
    let index = 0;
    productList.forEach( product => {
        html += buildProductCard(product, index);
        ++index;
    });

    Element.mainContent.innerHTML = html;
}

//Display product information
function buildProductCard(product, index){
    return `
            <div class="card" style="width: 18rem; display:inline-block; ">
                <img src="${product.imageURL}" class="card-img-top " >
                <div class="card-body">
                    <h5 class="card-title">${product.name}</h5>
                    <p class="card-text">
                        ${Util.currency(product.price) } <br>
                        ${product.summary}
                    </p>
                    <div class="container pt-3 bg-light  ${Auth.currentUser ? 'd-block' : 'd-none'} " >
                        <form method="post" class="d-inline form-decrease-qty">
                            <input type="hidden" name="index" value="${index}" >
                            <button class="btn btn-outline-danger" type="submit"> &minus; </button>
                        </form>
                        <div id="qty-${product.docId}" class="container rounded text-center text-white bg-primary d-inline-block w-50">
                            ${product.qty == null || product.qty == 0 ? 'Add' : product.qty}
                        </div>
                        <form method="post" class="d-inline form-increase-qty">
                            <input type="hidden" name="index" value="${index}" >
                            <button class="btn btn-outline-danger" type="submit"> &plus; </button>
                        </form>
                    </div>
                </div>
            </div>
  `
}

//load shopping cart info
export function getShoppingCartFromLocalStorage(){
    const cartStr = window.localStorage.getItem(`cart-${Auth.currentUser.uid}`)
    cart = ShoppingCart.parse(cartStr);
    if(!cart || !cart.isValid() || Auth.currentUser.uid != cart.uid ){
        window.localStorage.removeItem(`cart-${Auth.currentUser.uid}`);
        cart = new ShoppingCart(Auth.currentUser.uid);
    }
    Element.shoppingcartCount.innerHTML = cart.getTotalQty();
}

