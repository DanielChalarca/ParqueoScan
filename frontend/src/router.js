import { dashboardSettings } from "../../backend/controllers/dashboardSettings";
import { renderDashboard } from "../views/dashboard";

const routes = {
    "/": {
        renderView: renderDashboard,
        afterRender: dashboardSettings
    },
    "/dashboard": {
        renderView: renderDashboard,
        afterRender: dashboardSettings
    }
}

export function router() {
    const path = window.location.pathname || "/"
    const app = document.getElementById("app")
    const route = routes[path]
    app.innerHTML = route.renderView();
                    route.afterRender()
}