import * as Element from "./element.js";
import * as Routes from "../controller/routes.js";
import * as FirebaseController from "../controller/firebase_controller.js";
import * as Constant from "../model/constant.js";
import * as Util from "./util.js";
import * as Auth from "../controller/auth.js";

export function addEventListeners(){
    Element.menuUsers.addEventListener("click", async () => {
        const label = Util.disableButton(Element.menuUsers);
        history.pushState(null, null, Routes.routePathname.ADMINUSERS);
        await user_page();
        Util.enableButton(Element.menuUsers, label);
    })
}

export async function user_page(){
    let html = `
        <h1> Manage Users </h1>
        <table class="table table-striped">
            <tr>
                <td>
                    <form id="form-search-user">
                        <input name="searchUser" class="form-control" type="search" placeholder="Search a user" 
                        aria-label="Search">
                        <button class="btn btn-outline-success" type="submit">Search</button>
                    </form>
                </td>    
           </tr>
            
                <thead>
                    <tr>
                        <th scope="col">Image</th>
                        <th scope="col">Name</th>
                        <th scope="col">Address</th>
                        <th scope="col">Status</th>
                        <th scope="col">Actions</th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    let userList;
    try{
        userList = await FirebaseController.getUserList();
    }
    catch(e){
        if (Constant.DEV) console.log(e);
        Util.popupInfo("Error getUserList", JSON.stringify(e))
    }   

    userList.forEach(user => {
        html += buildUserCard(user);
    });

    Element.mainContent.innerHTML = html;

    //disable users
    const toggleForms = document.getElementsByClassName("form-toggle-users");
    for(let i=0; i < toggleForms.length; i++){
        toggleForms[i].addEventListener("submit", async e => {
            e.preventDefault();
            // Enable/disable button
            const button = e.target.getElementsByTagName("button")[0];
            const label = Util.disableButton(button);
            const uid = e.target.uid.value;
            const update = {
                disabled: e.target.disabled.value == "true" ? false : true
            }
            try {
                await FirebaseController.updateUser(uid, update);
                e.target.disabled.value = `${update.disabled}`;
                document.getElementById(`status-${uid}`).innerHTML = `${update.disabled ? "Disabled" : "Active"}`;
                Util.popupInfo("Status Toggled", `Disabled : ${update.disabled}`);
            } catch (e) {
                if (Constant.DEV) console.log(e);
                Util.popupInfo("Status toggled error", JSON.stringify(e));
            }

            Util.enableButton(button, label);
        });
    } 

    //delete user by uid
    const deleteForms = document.getElementsByClassName("form-delete-user");
    for(let i=0; i < deleteForms.length; i++){
        deleteForms[i].addEventListener("submit", async (e) => {
            e.preventDefault();
            //confirm
            const r = confirm("Are you sure to delete the user?");
            if(!r) return;

            //Disable button
            const button = e.target.getElementsByTagName("button")[0];
            Util.disableButton(button);

            const uid = e.target.uid.value;
            try {
                await FirebaseController.deleteUser(uid);
                //remove user from web browser
                document.getElementById(`user-${uid}`).remove();
                Util.popupInfo("Deleted ", `user deleted: uid-${uid}`);
            } catch (e) {
                if (Constant.DEV) console.log(e);
                Util.popupInfo("Delete user  error", JSON.stringify(e));
            } 
        });
    }

    //search user by name
    const formSearchUser = document.getElementById("form-search-user");
    formSearchUser.addEventListener("submit", async (e) => {
        e.preventDefault();
        const searchUserButton = formSearchUser.getElementsByTagName("button")[0];
        const label = Util.disableButton(searchUserButton);
        const searchUserName = e.target.searchUser.value.trim();
        if (searchUserName.length == 0){
            Util.popupInfo("No user specified", "Enter a name to search");
            Util.enableButton(searchUserButton, label);
            return 
        }    
        search_user(searchUserName);
        e.target.searchUser.value = "";
        Util.enableButton(searchUserButton, label);
        
        
    });
}

//Build user card
function buildUserCard(user){
        return `
                <tr id="user-${user.docId}">
                <td><img src= " ${user.photoURL != null ? user.photoURL : "images/blank_profile.png"} " > </td>
                <td> ${user.name} </td>
                <td> ${user.address}, ${user.city}, ${user.state}, ${user.zip} </td>
                <td> 
                    <span id="status-${user.docId}"> ${user.disabled ? "Disabled" : "Active"}  </span> <br>
                </td>
                <td>
                    <form class="form-toggle-users float-left" method="post">
                        <input type="hidden" name="uid" value="${user.docId}">
                        <input type="hidden" name="disabled" value="${user.disabled}">
                        <button class="btn btn-outline-primary" type="submit"> Toggle Active </button>
                    </form>
                    <form class="form-delete-user float-right" method="post">
                        <input type="hidden" name="uid" value="${user.docId}">
                        <button class="btn btn-outline-danger" type="submit"> Delete </button>
                    </form>
                </td>
            </tr>`;
}

//search user
async function search_user(searchUserName){
    if (!Auth.currentUser){
        Element.mainContent.innerHTML = "<h1>Protected Page</h1>"
        return
    }
    
    try{
        // Perform a search from database
        const result = await FirebaseController.searchUser(searchUserName);
        buildResultPage(result);
    }
    catch(e){
        if (Constant.DEV) console.log(e);
        return;
    }


    
}

function buildResultPage(result){
    let html = `
                <table class="table table-striped">
                    <thead>
                        <tr>
                            <th scope="col">Image</th>
                            <th scope="col">Name</th>
                            <th scope="col">Address</th>
                            <th scope="col">Status</th>
                            <th scope="col">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
    `;

    result.forEach(user => {
        html += buildUserCard(user);
    });

    Element.mainContent.innerHTML = html;

        //disable users
        const toggleForms = document.getElementsByClassName("form-toggle-users");
        for(let i=0; i < toggleForms.length; i++){
            toggleForms[i].addEventListener("submit", async e => {
                e.preventDefault();
                // Enable/disable button
                const button = e.target.getElementsByTagName("button")[0];
                const label = Util.disableButton(button);
                const uid = e.target.uid.value;
                const update = {
                    disabled: e.target.disabled.value == "true" ? false : true
                }
                try {
                    await FirebaseController.updateUser(uid, update);
                    e.target.disabled.value = `${update.disabled}`;
                    document.getElementById(`status-${uid}`).innerHTML = `${update.disabled ? "Disabled" : "Active"}`;
                    Util.popupInfo("Status Toggled", `Disabled : ${update.disabled}`);
                } catch (e) {
                    if (Constant.DEV) console.log(e);
                    Util.popupInfo("Status toggled error", JSON.stringify(e));
                }
    
                Util.enableButton(button, label);
            });
        } 
    
        //delete user by uid
        const deleteForms = document.getElementsByClassName("form-delete-user");
        for(let i=0; i < deleteForms.length; i++){
            deleteForms[i].addEventListener("submit", async (e) => {
                e.preventDefault();
                //confirm
                const r = confirm("Are you sure to delete the user?");
                if(!r) return;
    
                //Disable button
                const button = e.target.getElementsByTagName("button")[0];
                Util.disableButton(button);
    
                const uid = e.target.uid.value;
                try {
                    await FirebaseController.deleteUser(uid);
                    //remove user from web browser
                    document.getElementById(`user-${uid}`).remove();
                    Util.popupInfo("Deleted ", `user deleted: uid-${uid}`);
                } catch (e) {
                    if (Constant.DEV) console.log(e);
                    Util.popupInfo("Delete user  error", JSON.stringify(e));
                } 
            });
        }
    

}