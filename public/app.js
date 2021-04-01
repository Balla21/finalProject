import * as Routes from "./controller/routes.js";
import * as Auth from "./controller/auth.js";
import * as HomePage from "./viewpage/home_page.js";
import * as ReviewPage from "./viewpage/reviews_page.js";
import * as UserPage from "./viewpage/user_page.js";
import * as UserProfilePage from "./viewpage/user_profile_page.js";
import * as UserShoppingPage from "./viewpage/user_shoppingcart_page.js"
import * as UserPurchasesPage from "./viewpage/user_purchases_page.js";
import * as AdminAddProductPage from "./controller/admin_add_product_page.js";
import * as AdminProductPage from "./viewpage/admin_product_page.js";
import * as AdminEditProductPage from "./controller/admin_edit_product_page.js";
import * as AdminUserPage from "./viewpage/admin_user_page.js";
import * as UserReviewProductPage from "./controller/user_review_product_page.js";
import * as UserReviewPage from "./viewpage/user_reviews_page.js";
import * as UserEditReview from "./controller/user_edit_review_page.js";

window.onload = () => {
    const path = window.location.pathname;
    Routes.routing(path);
}

window.addEventListener("popstate", e => {
    e.preventDefault();
    const pathname = e.target.location.pathname;
    Routes.routing(pathname);
})

Auth.addEventListeners();
HomePage.addEventListeners();
UserPage.addEventListeners();
UserProfilePage.addEventListeners();
UserShoppingPage.addEventListeners();
UserPurchasesPage.addEventListeners();
AdminProductPage.addEventListeners();
AdminAddProductPage.addEventListeners();
AdminEditProductPage.addEventListeners();
AdminUserPage.addEventListeners();
UserReviewProductPage.addEventListeners();
ReviewPage.addEventListeners();
UserReviewPage.addEventListeners();
UserEditReview.addEventListeners();