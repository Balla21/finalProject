import * as HomePage from "../viewpage/home_page.js";
import * as UserPage from "../viewpage/user_page.js";
import * as ReviewPage from "../viewpage/reviews_page.js";
import * as UserProfilePage from "../viewpage/user_profile_page.js";
import * as UserShoppingPage from "../viewpage/user_shoppingcart_page.js";
import * as UserPurchasesPage from "../viewpage/user_purchases_page.js";
import * as AdminProductPage from "../viewpage/admin_product_page.js";
import * as AdminUsersPage from "../viewpage/admin_user_page.js";
import * as UserReviewPage from "../viewpage/user_reviews_page.js";


export const routePathname = {
    HOME: '/home',
    USER: "/user",
    REVIEWS: "/reviews",
    USERREVIEWS:"/myreviews",
    USERPROFILE: "/profile",
    USERSHOPPING: "/shopping",
    USERPURCHASES: "/purchases",
    ADMINPRODUCTS: "/admin",
    ADMINUSERS: "/customers",
   
}

export const routes = [
    {pathname: routePathname.HOME, page:HomePage.home_page},
    {pathname: routePathname.USER, page:UserPage.user_page},
    {pathname: routePathname.REVIEWS, page:ReviewPage.review_page},
    {pathname: routePathname.USERREVIEWS, page:UserReviewPage.user_review_page},
    {pathname: routePathname.USERPROFILE, page:UserProfilePage.user_profile_page},
    {pathname: routePathname.USERSHOPPING, page:UserShoppingPage.user_shoppingcart_page},
    {pathname: routePathname.USERPURCHASES, page:UserPurchasesPage.user_purchases_page},
    {pathname: routePathname.ADMINPRODUCTS, page:AdminProductPage.product_page},
    {pathname: routePathname.ADMINUSERS, page:AdminUsersPage.user_page},
];


//routing function
export function routing(path){
    const route = routes.find(r => r.pathname == path)
    if(route) route.page()
    else routes[0].page();
}