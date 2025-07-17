import { dashboardSettings } from "../../backend/controllers/dashboardSettings";
import { renderDashboard } from "../views/dashboard";
import { renderLogin } from "../views/login";
import { renderRegister } from "../views/register";
import { loginSettings, registerSettings } from "../../backend/controllers/authSettings";

const routes = {
    "/": {
        renderView: renderLogin,
        afterRender: loginSettings,
        private: false,
        loggedIn: true
    },
    "/login": {
        renderView: renderLogin,
        afterRender: loginSettings,
        private: false,
        loggedIn: true
    },
    "/register": {
        renderView: renderRegister,
        afterRender: registerSettings,
        private: false,
        loggedIn: true
    },
    "/dashboard": {
        renderView: renderDashboard,
        afterRender: dashboardSettings,
        private: true,
        loggedIn: false
    }
}

export function router() {
    const path = window.location.pathname || "/"
    const app = document.getElementById("app")
    const route = routes[path]

    if (route) {
        if (route.private && !localStorage.loggedInUser) {
            alert("no tienes permitido ver esto.");
            window.location.href = "/login";
            return;
        } else if (route.loggedIn && localStorage.loggedInUser) {
            alert("ya estas loggeado")
            window.location.href = "/dashboard"
            return;
        }
        app.innerHTML = route.renderView();
        if (route.afterRender) {
            route.afterRender();
        }

    } else { app.innerHTML = show404() }
}