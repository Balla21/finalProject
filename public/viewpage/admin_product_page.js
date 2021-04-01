import * as Element from "./element.js";
import * as FirebaseController from "../controller/firebase_controller.js";
import  * as Add from "../controller/admin_add_product_page.js";
import * as Util from "./util.js";
import * as Routes from "../controller/routes.js";
import * as Constant from "../model/constant.js";
import { Product } from "../model/product.js";
import * as Edit from "../controller/admin_edit_product_page.js";


export function addEventListeners(){
    Element.menuProducts.addEventListener("click", async () => {
        history.pushState(null, null, Routes.routePathname.ADMINPRODUCTS);
        const button = Element.menuProducts;
        const label = Util.disableButton(button);
        await product_page();
        Util.enableButton(button,label);
    })
}


export async function product_page(){
    let html = `
        <div>
            <button id="button-add-product" class="btn btn-outline-danger"> +Add Product </button>
        </div>
    `;

    //Read product information
    let products ;
    try{
        products = await FirebaseController.admin_getProductList();
    }
    catch(e){
        if (Constant.DEV) console.log(e);
        Util.popupInfo("getProductList error", JSON.stringify(e) );
    }

    products.forEach( p => {
        html += buildProductCard(p) ;
    } );


    Element.mainContent.innerHTML = html;

    document.getElementById("button-add-product").addEventListener("click", () => {
        Element.formAddProduct.reset();
        Add.resetImageSelection();
        $("#modal-add-product").modal("show");
    });


    //Edit button addEventLister
        const editButtons = document.getElementsByClassName("form-edit-product");
        for(let i = 0; i < editButtons.length; i++){
            editButtons[i].addEventListener("submit", async (e) => {
                e.preventDefault();
                const button = e.target.getElementsByTagName("button")[0];
                const label = Util.disableButton(button);
                await Edit.edit_product(e.target.docId.value);
                Util.enableButton(button, label);
            });
        }

    //Delete button addEventListener
    const deleteButtons = document.getElementsByClassName("form-delete-product");
    for(let i = 0; i < deleteButtons.length; i++){
        deleteButtons[i].addEventListener("submit", async (e) => {
            e.preventDefault();
            const button = e.target.getElementsByTagName("button")[0];
            const label = Util.disableButton(button);
            await Edit.delete_product(e.target.docId.value, e.target.imageName.value);
            Util.enableButton(button, label);
        });
    }
}


//Build a product view card
function buildProductCard(product){
    return `
            <div id="card-${product.docId}" class="card" style="width: 18rem; display: inline-block;">
                <img src= " ${product.imageURL} " class="card-img-top" >
                <div class="card-body">
                    <h5 class="card-title"> ${product.name} </h5>
                    <p class="card-text">$ ${product.price} <br> ${product.summary}  </p>
                </div>
                <form class="form-edit-product float-left" method="post">
                    <input type="hidden" name="docId" value="${product.docId}">
                    <button class="btn btn-outline-primary" type="submit"> Edit </button>
                </form>
                <form class="form-delete-product float-right" method="post">
                    <input type="hidden" name="docId" value="${product.docId}">
                    <input type="hidden" name="imageName" value="${product.imageName}">
                    <button class="btn btn-outline-danger" type="submit"> Delete </button>
                </form>
            </div>
    `;
}