import * as Element from "./element.js";
import * as Routes from "../controller/routes.js";
import * as FirebaseController from "../controller/firebase_controller.js";
import * as Constant from "../model/constant.js";
import * as Util from "./util.js";
import * as Auth from "../controller/auth.js";
import { ShoppingCart } from "../model/shoppingcart.js";
import { Product } from "../model/product.js";


export function addEventListeners(){
    //search page
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


    Element.menuButtonCatalog.addEventListener("click",  ()=>{
        history.pushState(null, null,Routes.routePathname.USER);
        user_page();
    });

    history.pushState(null, null,Routes.routePathname.USER);
    user_page();
}

export let cart
let products;

export async function user_page(){
    let html = ` <h1>Enjoy your time at our store </h1>`;

    //Get list of product
    try{
        products = await FirebaseController.getProductList();
        if (cart && cart.items){
            cart.items.forEach(item => {
                const product = products.find(p => {
                    return item.docId == p.docId;
                })
                product.qty = item.qty;
            })
        }
         // product quantity
         let index = 0;
         products.forEach( product => {
             html += buildProductCard(product, index);
             ++index;
         });
    }
    catch(e){
         if(Constant.DEV) console.log(e);
         Util.popupInfo("getProductList Error", JSON.stringify(e));
         return;
    }
    Element.mainContent.innerHTML = html; 
    
    

    // + button add event listener
    const plusForms = document.getElementsByClassName("form-increase-qty");
    for(let i =0; i <plusForms.length; i++){
        plusForms[i].addEventListener("submit", (e) => {
            e.preventDefault();
            const p = products[e.target.index.value];
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
            const p = products[e.target.index.value];
            cart.removeItem(p);
            document.getElementById(`qty-${p.docId}`).innerHTML = ( p.qty == null || p.qty == 0 ) ? "Add" : p.qty;
            Element.shoppingcartCount.innerHTML = cart.getTotalQty();
        });
    }
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

//search product page
export async function search_page(searchKeyword){
    if (!Auth.currentUser){
        Element.mainContent.innerHTML = "<h1>Protected Page</h1>"
        return
    }
    
    try{
        // Perform a search from database
        products = await FirebaseController.searchProduct(searchKeyword);
        if (cart && cart.items){
            cart.items.forEach(item => {
                const product = products.find(p => {
                    return item.docId == p.docId;
                    
                })
                //console.log(product);
                //product.qty = item.qty;
                //product.qty = 0;
            })
        }
       
    }
    catch(e){
        if (Constant.DEV) console.log(e);
        return;
    }
    
    buildSearchPage(products);

     // + button add event listener
     const plusForms = document.getElementsByClassName("form-increase-qty");
     for(let i =0; i <plusForms.length; i++){
         plusForms[i].addEventListener("submit", (e) => {
             e.preventDefault();
             const p = products[e.target.index.value];
             cart.addItem(p);
             document.getElementById(`qty-${p.docId}`).innerHTML = p.qty;
             Element.shoppingcartCount.innerHTML = cart.getTotalQty();
         });
     }
}

//build search product page
export function buildSearchPage(products){
    // product quantity
    let html = "";
    let index = 0;
    products.forEach( product => {
        html += buildProductCard(product, index);
        ++index;
    });

    Element.mainContent.innerHTML = html;
}