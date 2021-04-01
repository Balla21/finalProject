export class Comment {
    constructor(data){
        this.review = data.review;
        this.timestamp = data.timestamp;
        this.userId = data.userId;
        this.productId = data.productId;
        this.productName = data.productName;
        this.imageURL = data.imageURL;
        this.userName = data.userName;

    }

    serialize(){
        return {
            review: this.review, 
            timestamp: this.timestamp,
            userId: this.userId,
            productId: this.productId,
            productName: this.productName,
            imageURL : this.imageURL,
            userName:this.userName
        }
    }

    validate(){
        const errors = {};
        if (!this.review || this.review.length < 2){
            errors.review = "Review content should be min 2 chars";
        }
        if( Object.keys(errors).length == 0 ) return null;
        else return errors;
    }

     //update product
     serializeForUpdate(){
        const comment= {};
        if (this.review) comment.review = this.review;
        if (this.timestamp) comment.timestamp = this.timestamp;
        if (this.userId) comment.userId = this.userId;
        if (this.productId) comment.productId = this.productId;
        if (this.productName) comment.productName = this.productName;
        if (this.imageURL) comment.imageURL = this.imageURL;
        if (this.userName) comment.userName = this.userName;
        return comment;
    }
}