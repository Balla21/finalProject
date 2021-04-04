import  { Product } from "../model/product.js";
import * as Constant from "../model/constant.js" 
import { ShoppingCart } from "../model/shoppingcart.js";
import { AccountInfo } from "../model/account_info.js";
import { Comment } from "../model/comments.js";




//Sign in Authtentication
export async function signIn(email, password){
    await firebase.auth().signInWithEmailAndPassword(email,password);
}

//Sign out Authentication
export async function signOut(){
    await firebase.auth().signOut();
}

//Get product lists
export async function getProductList(){
    let products = [];
    const snapshot = await firebase.firestore().collection(Constant.collectionName.PRODUCTS).orderBy("name").get();
    snapshot.forEach(doc => { 
        const p = new Product( doc.data() );
        p.docId = doc.id;
        products.push(p);
    });
    return products; 
}


//get Account info of user
export async function getAccountInfo(uid){
    const doc = await firebase.firestore().collection(Constant.collectionName.ACCOUNT_INFO).doc(uid).get();
    if (doc.exists){
        return new AccountInfo(doc.data());
    }
    else {
        const defaultInfo = AccountInfo.instance();
        await firebase.firestore().collection(Constant.collectionName.ACCOUNT_INFO).doc(uid).set(defaultInfo.serialize());
        return defaultInfo;
    }
}

//Update account info
export async function updateAccountInfo(uid, updateInfo) {
    await firebase.firestore().collection(Constant.collectionName.ACCOUNT_INFO).doc(uid).update(updateInfo)
}

//upload photo
export async function uploadProfilePhoto(photoFile, imageName){
    const ref = firebase.storage().ref().child(Constant.storageFolderName.PROFILE_PHOTOS + imageName);
    const taskSnapShot = await ref.put(photoFile);
    const photoURL = await taskSnapShot.ref.getDownloadURL();
    return photoURL;
}

//get purchase history from user
export async function getPurchaseHistory(uid){
    const snapShot = await firebase.firestore().collection(Constant.collectionName.PURCHASE_HISTORY).where("uid", "==", uid).orderBy("timestamp", "desc").get();
    const carts = [];
    snapShot.forEach( doc => { 
        const sc = ShoppingCart.deserialize(doc.data());
        carts.push(sc);
    });
    return carts;
}

//Check out purchase
export async function checkOut(cart){
    const data = cart.serialize( Date.now() );
    await firebase.firestore().collection(Constant.collectionName.PURCHASE_HISTORY).add(data);
}

//upload image to the database
export async function uploadImage(imageFile, imageName){
    if(!imageName){
        imageName = Date.now() + imageFile.name;
    }
    const ref = firebase.storage().ref().child(Constant.storageFolderName.PRODUCT_IMAGES + imageName);
    const taskSnapshot = await ref.put(imageFile);
    const imageURL = await taskSnapshot.ref.getDownloadURL();
    return {imageName, imageURL};
}

//addProduct function
const cf_addProduct = firebase.functions().httpsCallable("admin_addProduct");
export async function addProduct(product){
    await cf_addProduct(product);
}

//Get product list
const cf_getProduct = firebase.functions().httpsCallable("admin_getProductList");
export async function admin_getProductList(){
    const products = [];
    const result = await  cf_getProduct();
    result.data.forEach(data => {
        const p = new Product(data);
        p.docId = data.docId;
        products.push(p);
    }); 
    return products;
}

//Get product by Id
const cf_getProductById = firebase.functions().httpsCallable("admin_getProductById")
export async function getProductById(docId){
    const result = await cf_getProductById(docId);
    if(result.data){
        const product = new Product(result.data);
        product.docId = result.data.docId;
        return product;
    }
    else{
        return null;
    }
}


//Update Product
const cf_updateProduct = firebase.functions().httpsCallable("admin_updateProduct");
export async function updateProduct(product){
    const docId = product.docId;
    const data = product.serializeForUpdate();
    await cf_updateProduct({docId, data});
}

//Delete Product
const cf_deleteProduct = firebase.functions().httpsCallable("admin_deleteProduct");
export async function deleteProduct(docId, imageName){
   await cf_deleteProduct(docId);
   const ref = firebase.storage().ref().child(Constant.storageFolderName.PRODUCT_IMAGES + imageName);
   await ref.delete();
}

//getUserList
const cf_getUserList = firebase.functions().httpsCallable("admin_getUserList");
export async function getUserList(){
    const result = await cf_getUserList();
    return result.data;
}

//updateUser
const cf_updateUser = firebase.functions().httpsCallable("admin_updateUser");
export async function updateUser(uid, update){
    await cf_updateUser({uid, update});
}

//delete user
const cf_deleteUser = firebase.functions().httpsCallable("admin_deleteUser");
export async function deleteUser(uid){
    await cf_deleteUser(uid);
}

//user get product by Id
export async function userGetProductById(docId){
    const ref = await firebase.firestore().collection(Constant.collectionName.PRODUCTS).doc(docId).get();
    if(!ref.exists){
        return null;
    }
    const prod = new Product(ref.data());
    prod.docId = docId;
    return prod;

}

//add review from user
export async function addReview(comment){
    const review = await firebase.firestore().collection(Constant.collectionName.COMMENTS).add(comment);
}

//get the list of all reviews
export async function getReviewsList(){
    let reviews = [];
    const snapshot = await firebase.firestore().collection(Constant.collectionName.COMMENTS).orderBy("timestamp", "desc").get();
    snapshot.forEach(doc => { 
        const c = new Comment( doc.data() );
        c.docId = doc.id;
        reviews.push(c);
    });
    return reviews; 
}


//get the list of all reviews
export async function getReviewsListByUser(userId){
    let userReviews = [];
    const snapshot = await firebase.firestore().collection(Constant.collectionName.COMMENTS).where("userId", "==", userId)
                            .orderBy("timestamp", "desc").get();
    snapshot.forEach(doc => { 
        const uc = new Comment( doc.data() );
        uc.docId = doc.id;
        userReviews.push(uc);
    });
    return userReviews; 
}


//delete review from Id
const cf_deleteReviewById= firebase.functions().httpsCallable("be_deleteReviewById");
export async function deleteReviewById(reviewId){
    await cf_deleteReviewById(reviewId);
}   

//user get review by Id
export async function getReviewById(docId){
    const ref = await firebase.firestore().collection(Constant.collectionName.COMMENTS).doc(docId).get();
    if(!ref.exists){
        return null;
    }
    const comment = new Comment(ref.data());
    comment.docId = docId;
    return comment;
}

//Update Product
const cf_updateComment = firebase.functions().httpsCallable("be_updateComment");
export async function updateReview(review){
    const docId = review.docId;
    const data = review.serializeForUpdate();
    await cf_updateComment({docId, data});
}

//delete user account
const cf_deleteAccountInfo = firebase.functions().httpsCallable("be_deleteAccountInfo");
export async function deleteAccountInfo(uid){
    await cf_deleteAccountInfo(uid);
}


//search product list
export async function searchProduct(keyword){
    const productList = [];
    const snapShot = await firebase.firestore().collection(Constant.collectionName.PRODUCTS).where("name","==",keyword).get();
    snapShot.forEach(doc => {
        const prod = new Product(doc.data());
        prod.docId = doc.id;
        productList.push(prod);
    });
    return productList;
}

//search user account
export async function searchUser(username){
    const userList = [];
    const snapShot = await firebase.firestore().collection(Constant.collectionName.ACCOUNT_INFO).where("name","==",username).get();
    snapShot.forEach(doc => {
        const user = new AccountInfo(doc.data());
        user.docId = doc.id;
        userList.push(user);
    });
    return userList;
}


//Get purchase history list
const cf_purchaseHistoryList = firebase.functions().httpsCallable("be_purchaseHistoryList");
export async function getPurchaseHistoryList(){
    const purchases = [];
    const result = await  cf_purchaseHistoryList();
    result.data.forEach(data => {
        const p = new ShoppingCart(data);
        p.docId = data.docId;
        purchases.push(p);
    }); 
    return purchases;
}

//get feedbacks list from the store
const cf_feedBackList = firebase.functions().httpsCallable("be_feedBackList");
export async function getFeedbacks(){
    let feedbacks = [];
    const result = await  cf_feedBackList();
    result.data.forEach(data => {
        const f = new Comment(data);
        f.docId = data.docId;
        feedbacks.push(f);
    }); 
    return feedbacks;
}

//search user account
export async function searchFeedBackProduct(productName){
    const feedbackList = [];
    const snapShot = await firebase.firestore().collection(Constant.collectionName.COMMENTS).where("productName","==",productName).orderBy("timestamp", "desc").get();
    snapShot.forEach(doc => {
        const feedback = new Comment(doc.data());
        feedback.docId = doc.id;
        feedbackList.push(feedback);
    });
    return feedbackList;
}