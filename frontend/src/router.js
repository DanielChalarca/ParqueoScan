// Importa las funciones de vistas
import { renderLogin } from "./views/login.js";
import { renderRegister } from "./views/register.js";
import { renderAdminDashboard } from "./views/dashboardAdmin.js"; // Importa el nuevo dashboard de admin
import { renderUserDashboard } from "./views/dashboardUser.js";   // Importa el nuevo dashboard de usuario
import { show404 } from "./views/404.js"; // Asumo que tienes un show404.js o similar

// Importa las funciones de configuración (afterRender)
import { loginSettings, registerSettings } from "../../backend/controllers/authSettings.js"; // Asegúrate de que la ruta sea correcta
// Importa las nuevas funciones de dashboard
import { adminDashboardSettings, userDashboardSettings } from "../../backend/controllers/dashboardSettings.js";

const routes = {
    "/": {
        renderView: renderLogin, // Por defecto, si no hay autenticación, va al login
        afterRender: loginSettings,
        private: false,
        // loggedIn: true // Esta propiedad es un poco redundante con la lógica de guardia abajo
    },
    "/login": {
        renderView: renderLogin,
        afterRender: loginSettings,
        private: false,
        // loggedIn: true
    },
    "/register": {
        renderView: renderRegister,
        afterRender: registerSettings,
        private: false,
        // loggedIn: true
    },
    "/dashboard-admin": { // Nueva ruta para el admin
        renderView: renderAdminDashboard,
        afterRender: adminDashboardSettings,
        private: true,
    },
    "/dashboard-user": { // Nueva ruta para el usuario
        renderView: renderUserDashboard,
        afterRender: userDashboardSettings,
        private: true,
    }
};

export function router() {
    const path = window.location.pathname || "/";
    const app = document.getElementById("app");
    const route = routes[path];

    const currentUser = JSON.parse(localStorage.getItem("user")); // Obtiene el objeto de usuario
    const isAuth = !!currentUser; // Verdadero si hay un usuario en localStorage

    // --- Lógica de Guardia Centralizada ---
    // 1. Si la ruta es privada y el usuario NO está autenticado
    if (route && route.private && !isAuth) {
        alert("Acceso denegado. Por favor, inicia sesión.");
        history.pushState({}, "", "/login");
        router(); // Volver a renderizar para mostrar el login
        return;
    }

    // 2. Si el usuario está autenticado y está en / o /login o /register, redirigir a su dashboard
    if (isAuth && (path === "/" || path === "/login" || path === "/register")) {
        alert("Ya estás autenticado. Redirigiendo a tu dashboard.");
        if (currentUser.role === "admin") {
            history.pushState({}, "", "/dashboard-admin");
        } else {
            history.pushState({}, "", "/dashboard-user");
        }
        router(); // Volver a renderizar para mostrar el dashboard correcto
        return;
    }

    // 3. Si la ruta tiene un rol específico y el usuario autenticado NO tiene ese rol
    if (route && route.private && isAuth && route.role && currentUser.role !== route.role) {
        alert("No tienes los permisos necesarios para acceder a esta página.");
        if (currentUser.role === "admin") {
            history.pushState({}, "", "/dashboard-admin");
        } else {
            history.pushState({}, "", "/dashboard-user");
        }
        router(); // Redirigir al dashboard permitido
        return;
    }

    // Si la ruta existe y pasa las guardias, renderizar
    if (route) {
        app.innerHTML = route.renderView();
        if (route.afterRender) {
            route.afterRender();
        }
    } else {
        // Ruta no encontrada
        app.innerHTML = show404();
    }
}

// Escuchador de eventos para el historial (navegación hacia atrás/adelante del navegador)
window.addEventListener("popstate", router);

// Escuchador de eventos delegado para clics en enlaces internos (SPA navigation)
document.addEventListener("click", (e) => {
    const { target } = e;
    // Si el clic es en un enlace y su origen es el mismo que el de la ventana actual
    if (target.matches("a") && target.origin === window.location.origin) {
        e.preventDefault(); // Previene la recarga completa
        history.pushState({}, "", target.href); // Actualiza la URL sin recargar
        router(); // Llama a la función del router para renderizar la nueva vista
    }
    // Considera delegación de eventos para botones de logout o marcar salida si no los tienes ya en afterRender
});

// Renderizar la ruta inicial al cargar la página
document.addEventListener("DOMContentLoaded", () => {
    router();
});