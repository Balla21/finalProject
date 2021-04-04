const functions = require("firebase-functions");

//Admin module
const admin = require("firebase-admin");
const serviceAccount = require("./account_key.json");

//file module
const Constant = require("./constant.js");

//exports cloud functions
exports.admin_addProduct = functions.https.onCall(addProduct);
exports.admin_getProductList = functions.https.onCall(getProductList);
exports.admin_getProductById = functions.https.onCall(getProductById);
exports.admin_updateProduct = functions.https.onCall(updateProduct);
exports.admin_deleteProduct = functions.https.onCall(deleteProduct);
exports.admin_getUserList = functions.https.onCall(getUserList);
exports.admin_updateUser = functions.https.onCall(updateUser);
exports.admin_deleteUser = functions.https.onCall(deleteUser);

//backend for delete review
exports.be_deleteReviewById = functions.https.onCall(deleteReviewById);

//backend for edit review
exports.be_updateComment = functions.https.onCall(updateComment);

//backend for delete account
exports.be_deleteAccountInfo = functions.https.onCall(deleteAccountInfo);

//backend for purchases list
exports.be_purchaseHistoryList = functions.https.onCall(purchaseHistoryList)


//admin verification
function isAdmin(email){
    return Constant.adminEmails.includes(email);
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});


//get all the product list from firebase
async function getProductList(data, context){
  if(!isAdmin(context.auth.token.email)){
    if(Constant.DEV) console.log("not admin", context.auth.token.email );
    throw new functions.https.HttpsError("unauthenicated", "Only admin can invoke this function");
  }
  try{
    let parray = [];
    const snapshot = await admin.firestore().collection(Constant.collectionName.PRODUCTS).orderBy('name').get();
    snapshot.forEach( doc => {
      const {name, price, summary, imageName, imageURL} = doc.data();
      const p = {name, price, summary, imageName, imageURL};
      p.docId = doc.id;
      parray.push(p);
    });
    return parray;
  }
  catch(e){
    if(Constant.DEV) console.log(e);
    throw new functions.https.HttpsError("internal", "getProductList failed");
  }
}


//add product to firebase
async function addProduct(data, context){

  if(!isAdmin(context.auth.token.email)){
    if(Constant.DEV) console.log("not admin", context.auth.token.email );
    throw new functions.https.HttpsError("unauthenicated", "Only admin can invoke this function");
  }

  //data conains product information
  try{
    admin.firestore().collection(Constant.collectionName.PRODUCTS).add(data);
  }
  catch(e){
    if(Constant.DEV) console.log(e);
    throw new functions.https.HttpsError("internal", "addProduct failed");
  }
}

//Get product by Id
async function getProductById(docId, context){
  if(!isAdmin(context.auth.token.email)){
    if(Constant.DEV) console.log("not admin", context.auth.token.email );
    throw new functions.https.HttpsError("unauthenicated", "Only admin can invoke this function");
  }

  try{
    const doc = await admin.firestore().collection(Constant.collectionName.PRODUCTS).doc(docId).get();
    if(doc.exists){
      const {name, summary, price, imageName, imageURL} = doc.data();
      const p = {name, price, summary, imageName, imageURL};
      p.docId = doc.id;
      return p;
    }
    else {
      return null;
    }
  }
  catch(e){
    if(Constant.DEV) console.log(e);
    throw new functions.https.HttpsError("internal", "getByProductById failed");
  }
}

//Update Product
async function updateProduct(productInfo, context){
  if(!isAdmin(context.auth.token.email)){
    if(Constant.DEV) console.log("not admin", context.auth.token.email );
    throw new functions.https.HttpsError("unauthenicated", "Only admin can invoke this function");
  }
  try{
      await admin.firestore().collection(Constant.collectionName.PRODUCTS).doc(productInfo.docId).update(productInfo.data);
  } 
  catch(e){
    if(Constant.DEV) console.log(e);
    throw new functions.https.HttpsError("internal", "UpdateProduct failed");
  }
}

//delete Product
async function deleteProduct(docId, context){
  if(!isAdmin(context.auth.token.email)){
    if(Constant.DEV) console.log("not admin", context.auth.token.email );
    throw new functions.https.HttpsError("unauthenicated", "Only admin can invoke this function");
  }
  try{
     await admin.firestore().collection(Constant.collectionName.PRODUCTS).doc(docId).delete();
  } 
  catch(e){
    if(Constant.DEV) console.log(e);
    throw new functions.https.HttpsError("internal", "DeleteProduct failed");
  }
}


//Get all users 
/* async function getUserList(data, context){
  if(!isAdmin(context.auth.token.email)){
    if(Constant.DEV) console.log("not admin", context.auth.token.email );
    throw new functions.https.HttpsError("unauthenicated", "Only admin can invoke this function");
  }
  const userList = [];
  try{
    let userRecord = await admin.auth().listUsers(2);
    userList.push(...userRecord.users);
    let nextPageToken = userRecord.pageToken;
    while(nextPageToken){
      userRecord = await admin.auth().listUsers(2, nextPageToken);
      userList.push(...userRecord.users);
      nextPageToken = userRecord.pageToken;
    }
    return userList;
  } 
  catch(e){
    if(Constant.DEV) console.log(e);
    throw new functions.https.HttpsError("internal", "getUserList failed");
  }
} */

//Get all users
async function getUserList(data, context){
  if(!isAdmin(context.auth.token.email)){
    if(Constant.DEV) console.log("not admin", context.auth.token.email );
    throw new functions.https.HttpsError("unauthenicated", "Only admin can invoke this function");
  }
  let userList = [];
  try{
    userList;
    const snapshot = await admin.firestore().collection(Constant.collectionName.USERS).get();
    snapshot.forEach( doc => {
      const {name, address,city, state, zip ,photoURL } = doc.data();
      const u = {name, address,city, state, zip ,photoURL };
      u.docId = doc.id;
      userList.push(u);
    });
    return userList;
  }
  catch(e){
    if(Constant.DEV) console.log(e);
    throw new functions.https.HttpsError("internal", "getUserList failed");
  }
}



//update user
async function updateUser(data, context){
  if(!isAdmin(context.auth.token.email)){
    if(Constant.DEV) console.log("not admin", context.auth.token.email );
    throw new functions.https.HttpsError("unauthenicated", "Only admin can invoke this function");
  }

  try{
    const uid = data.uid;
    const update = data.update;
    await admin.auth().updateUser(uid, update);

  }
  catch(e){
    if(Constant.DEV) console.log(e);
    throw new functions.https.HttpsError("internal", "UpdateUser failed");
  }
}

//delete user account
async function deleteUser(uid, context){
  if(!isAdmin(context.auth.token.email)){
    if(Constant.DEV) console.log("not admin", context.auth.token.email );
    throw new functions.https.HttpsError("unauthenticated", "Only admin can invoke this function");
  }
  try{
      await admin.firestore().collection(Constant.collectionName.USERS).doc(uid).delete();
  }catch(e){
      if(Constant.DEV) console.log(e);
      throw new functions.https.HttpsError("internal", "DeleteUser failed");
  }
}

//delete review by id
async function deleteReviewById(docId){
  try{
     await admin.firestore().collection(Constant.collectionName.COMMENTS).doc(docId).delete();
  } 
  catch(e){
    if(Constant.DEV) console.log(e);
    throw new functions.https.HttpsError("internal", "DeleteReview failed");
  }
}

//Update Comment
async function updateComment(commentInfo, context){
  try{
      await admin.firestore().collection(Constant.collectionName.COMMENTS).doc(commentInfo.docId).update(commentInfo.data);
  } 
  catch(e){
    if(Constant.DEV) console.log(e);
    throw new functions.https.HttpsError("internal", "UpdateComment failed");
  }
}

//Delete account
async function deleteAccountInfo(uid, context){
  try{
    await admin.firestore().collection(Constant.collectionName.USERS).doc(uid).delete();
  } 
  catch(e){
    if(Constant.DEV) console.log(e);
    throw new functions.https.HttpsError("internal", "deleteAccountInfo failed");
  }
}


//purchase history list
async function purchaseHistoryList(data, context){
  if(!isAdmin(context.auth.token.email)){
    if(Constant.DEV) console.log("not admin", context.auth.token.email );
    throw new functions.https.HttpsError("unauthenicated", "Only admin can invoke this function");
  }
  try{
    let parray = [];
    const snapshot = await admin.firestore().collection(Constant.collectionName.PURCHASES).orderBy('timestamp', "desc").get();
    snapshot.forEach( doc => {
      const {uid, items, timestamp} = doc.data();
      const p = {uid, items, timestamp};
      p.docId = doc.id;
      parray.push(p);
    });
    return parray;
  }
  catch(e){
    if(Constant.DEV) console.log(e);
    throw new functions.https.HttpsError("internal", "purchaseHistoryList failed");
  }
}