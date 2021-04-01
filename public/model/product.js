export class Product {
    constructor(data){
        this.name = data.name.toLowerCase(),
        this.price = typeof data.price == "number" ? data.price : Number(data.price);
        this.summary = data.summary;
        this.imageName = data.imageName;
        this.imageURL = data.imageURL;
        this.qty = data.qty;

    }

    serialize(){
        return {
            name: this.name, 
            price: this.price,
            summary: this.summary,
            imageName: this.imageName,
            imageURL: this.imageURL,
            qty: this.qty,
        }
    }

    static isSerializedProduct(obj){
        if(!obj.name || typeof obj.name != "string") return false;
        if(!obj.price || typeof obj.price != "number") return false;
        if(!obj.summary || typeof obj.summary != "string") return false;
        if(!obj.imageName || typeof obj.imageName != "string") return false;
        if(!obj.imageURL || !obj.imageURL.includes("https") ) return false;
        if(!obj.qty || typeof obj.qty != "number") return false;

        return true;
    }

    //validate image
    validate(image){
        const errors = {};
        if (!this.name || this.name.length < 2){
            errors.name = "Product name should be min 2 chars";
        }
        if (!this.price || !Number(this.price) ){
            errors.price = "Price is invalid";
        }
        if (!this.summary || this.summary.length < 2){
            errors.summary = "Summary too short. Min 5 chars";
        }
        if (!image){
            errors.image = "image not selected";
        }
        if( Object.keys(errors).length == 0 ) return null;
        else return errors;
    }

    //update product
    serializeForUpdate(){
        const p = {};
        if (this.name) p.name = this.name;
        if (this.price) p.price = this.price;
        if (this.summary) p.summary = this.summary;
        if (this.image) p.image = this.image;
        if (this.imageURL) p.imageURL = this.imageURL;
        return p;
    }
}