import * as Element from "../viewpage/element.js";
import * as FirebaseController from "./firebase_controller.js";
import * as Constant from "../model/constant.js";
import * as Util from "../viewpage/util.js";
import * as Routes from "./routes.js";
import * as UserPage from "../viewpage/user_page.js";
import * as UserProfilePage from "../viewpage/user_profile_page.js";



export let currentUser;

export function addEventListeners(){
    //SignIn button event
    Element.formSignIn.addEventListener("submit", async (e) => {
        e.preventDefault();
        const email = e.target.email.value;
        const password = e.target.password.value;
        try{
            await FirebaseController.signIn(email, password);
            $("#modal-form-signin").modal("hide");
        }
        catch(e){
            if(Constant.DEV) console.log(e);
            Util.popupInfo("Sign In Error", JSON.stringify(e), "modal-form-signin");
        }
        Element.formSignIn.reset();
    });

      //SignOut button event
      Element.menuButtonSignOut.addEventListener("click", async () => {
        try {
            await FirebaseController.signOut();
          
        } catch (e) {
            if(Constant.DEV) console.log(e);
            Util.popupInfo("Sign Out Error", JSON.stringify(e))
        }
    });

    //User create account
     //SignUp Button event
     Element.buttonSignUp.addEventListener("click", ()=>{
        //Signup modal
        $("#modal-form-signin").modal("hide");
        Element.formSignUp.reset();
        $("#modal-form-signup").modal("show");

    });

    Element.formSignUp.addEventListener("submit", (e)=>{
        e.preventDefault();
        sign_up(e.target);
    });

 



    //Authentication changed
    firebase.auth().onAuthStateChanged( async (user) => {
        if(user){
            currentUser = user;

            let preElements = document.getElementsByClassName("menu-pre-auth");
            for(let i = 0; i < preElements.length; i++){
                preElements[i].style.display = "none";
            }
          

            //User is not administrator
            if(currentUser.uid != Constant.ADMIN_ID ){
                UserPage.getShoppingCartFromLocalStorage()

                // read account info
                const accountInfo = await FirebaseController.getAccountInfo(user.uid);
                UserProfilePage.setProfileIcon(accountInfo.photoURL);

                //show user button features
                    let userElements = document.getElementsByClassName("menu-user-auth");
                    for(let i = 0; i < userElements.length; i++){
                        userElements[i].style.display = "block";
                    }
                    let menuHome =  document.getElementsByClassName("menu-home-auth")[0];
                    menuHome.style.display = "none";

                history.pushState(null, null, Routes.routePathname.USER);
                const path = window.location.pathname;
                Routes.routing(path);
            }

            //user is administrator
            else if(currentUser.uid == Constant.ADMIN_ID && Constant.adminEmails.includes(user.email) ){
                //show admin button features
                    let adminElements = document.getElementsByClassName("menu-admin-auth");
                    for(let i = 0; i < adminElements.length; i++){
                        adminElements[i].style.display = "block";
                    }
                    let menuHome =  document.getElementsByClassName("menu-home-auth")[0];
                    menuHome.style.display = "none";

                history.pushState(null, null, Routes.routePathname.ADMINPRODUCTS);
                const path = window.location.pathname;
                Routes.routing(path);
            }
        }
        // user signed out
        else{
            currentUser = null;
            let preElements = document.getElementsByClassName("menu-pre-auth");
            for(let i = 0; i < preElements.length; i++){
                preElements[i].style.display = "block";
            }
            let postElements = document.getElementsByClassName("menu-post-auth");
            for(let i = 0; i < postElements.length; i++){
                postElements[i].style.display = "none";
            }
            let menuHome =  document.getElementsByClassName("menu-home-auth")[0];
            menuHome.style.display = "block";
            history.pushState(null, null, Routes.routePathname.HOME);
            const path = window.location.pathname;
            Routes.routing(path);
        }
    });

}

   //SignUp function
   async function sign_up(form){
    const email = form.email.value;
    const password = form.password.value;
    const passwordConfirm = form.passwordConfirm.value;

    Element.formSignUpPasswordError.innerHTML = "";
    if(password != passwordConfirm){
        Element.formSignUpPasswordError.innerHTML = "Two Password do not match";
        return;
    }
    try {
        await FirebaseController.createUser(email, password);
        Util.popupInfo("Account Created!", "You are now signed in", "modal-form-signup");

    } catch (e) {
        if(Constant.DEV){
            console.log(e);
            Util.popupInfo( "Failed to create a new account", JSON.stringify(e), "modal-form-signup" );
        }
    }

}