import { Product } from "./product.js";

export class ShoppingCart{
    constructor(uid){
        this.uid = uid;
        this.items // array of product items
    }

    //add item
    addItem(product){
        if (!this.items){
            this.items = [];
        }
        const item = this.items.find( element => { return product.docId == element.docId } );
        if(item){
            ++product.qty;
            ++item.qty;
        }
        else {
            // new item to add
            product.qty = 1;
            const newItem = product.serialize();
            newItem.docId = product.docId;
            this.items.push(newItem);
        }
        this.saveToLocalStorage();
    }

    //remove item
    removeItem(product){
        //decrease qty or remove from the items from the array 
        const index = this.items.findIndex( element => { return product.docId == element.docId } );
        if(index >= 0){
            --this.items[index].qty;
            --product.qty;
            if(product.qty == 0){
                this.items.splice(index, 1);
            }
        }
        this.saveToLocalStorage();
    }

    //Shoppingcart total
    getTotalQty(){
        if(!this.items) return 0;
        let n = 0;
        this.items.forEach(item => { n += item.qty });
        return n
    }

    //total price of the shopping cart
    getTotalPrice(){
        if(!this.items){
            return 0;
        }
        let total = 0;
        this.items.forEach(item => { 
            total += item.price * item.qty;
        });
        return total;
    }

    //local storage
    saveToLocalStorage(){
        window.localStorage.setItem(`cart-${this.uid}`, this.stringify());
    }

    //parse String
    static parse(cartString){
        try{
            const obj = JSON.parse(cartString);
            const sc = new ShoppingCart(obj.uid);
            sc.items = obj.items;
            return sc;
        }
        catch(e){
            return null;
        }   
    }

    //store content of the shopping cart
    stringify(){
        return JSON.stringify({uid: this.uid, items: this.items})
    }

    //check shoppingcart validity
    isValid(){
        if(!this.uid || typeof this.uid != 'string') return false;
        if(!this.items || !Array.isArray(this.items) ) return false;
        for(let i = 0; i < this.items.length; i++){
            if(!Product.isSerializedProduct(this.items[i])) return false;
        }
        return true;
    }

    //Serialize ShoppingCart
    serialize(timestamp){
        return {
            uid: this.uid,
            items: this.items,
            timestamp: timestamp,
        }
    }

    //deserialize shopping cart
   static deserialize(data){
        const sc = new ShoppingCart(data.uid);
        sc.items = data.items;
        sc.timestamp = data.timestamp;
        return sc;
    }

    //empty cart
    empty(){
        this.items = null;
    }
    
}