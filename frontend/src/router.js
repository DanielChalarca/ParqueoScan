// Importa las funciones de vistas
import { renderLogin } from "./views/login.js";
import { renderRegister } from "./views/register.js";
import { renderAdminDashboard } from "./views/dashboardAdmin.js"; // Importa el nuevo dashboard de admin
import { renderUserDashboard } from "./views/dashboardUser.js";   // Importa el nuevo dashboard de usuario
import { renderPaymentOptions } from "./views/paymentoptions.js";   // Importa el nuevo dashboard de usuario
import { renderAdminDashboardWorkers } from "./views/dashboardworker.js";   // Importa el nuevo dashboard de usuario
import { show404 } from "./views/404.js"; // Asumo que tienes un show404.js o similar

// Importa las funciones de configuración (afterRender)
import { loginSettings, registerSettings } from "../../backend/controllers/authSettings.js"; // Asegúrate de que la ruta sea correcta
// Importa las nuevas funciones de dashboard
import { adminDashboardSettings,adminDashboardWorkersSettings , userDashboardSettings } from "../../backend/controllers/dashboardSettings.js";

const routes = {
    "/": {
        renderView: renderLogin,
        afterRender: loginSettings,
        private: false,
    },
    "/login": {
        renderView: renderLogin,
        afterRender: loginSettings,
        private: false,
    },
    "/register": {
        renderView: renderRegister,
        afterRender: registerSettings,
        private: false,
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
    },
    "/payment-options": { // Nueva ruta para las opciones de pago
            renderView: renderPaymentOptions,
            afterRender: () => {
                // Lógica para el botón "Volver"
                const backButton = document.querySelector(".back-to-dashboard-button");
                if (backButton) {
                    backButton.addEventListener("click", () => {
                        history.pushState({}, "", "/dashboard-user"); // Vuelve al dashboard del usuario
                        router();
                    });
                }
                const logoutButton = document.getElementById("logout-button"); // Nuevo ID para el botón de logout del user dashboard
                if (logoutButton) {
                    logoutButton.addEventListener("click", (event) => {
                        event.preventDefault();
                        localStorage.removeItem("user"); // Consistente
                        history.pushState({}, "", "/login");
                        router(); // Renderiza la vista de login
                    });
                }
            },
            private: true, // Asume que necesitas estar logeado para ver las opciones de pago
    },
     "/Admindashboardworker": { // Nueva ruta para el trabajador
        renderView: renderAdminDashboardWorkers,
        afterRender:adminDashboardWorkersSettings,
        private: true,
    }
};

export function router() {
    const path = window.location.pathname || "/";
    const app = document.getElementById("app");
    const header = document.querySelector(".main-header"); // Selecciona el header
    const footer = document.querySelector(".main-footer"); // Selecciona el footer
    const route = routes[path];

    const currentUser = JSON.parse(localStorage.getItem("user"));
    const isAuth = !!currentUser;

    // --- Lógica para mostrar/ocultar Header y Footer ---
    if (path === "/login" || path === "/register") {
        if (header) header.style.display = "none";
        if (footer) footer.style.display = "none";
    } else {
        if (header) header.style.display = "flex"; // O 'block' si no usas flexbox para el header
        if (footer) footer.style.display = "block"; // O 'flex' si tu footer es flex
    }


    // --- Lógica de Guardia Centralizada ---
    // 1. Si la ruta es privada y el usuario NO está autenticado
    if (route && route.private && !isAuth) {
        alert("Acceso denegado. Por favor, inicia sesión.");
        history.pushState({}, "", "/login");
        router();
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
        router();
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
        router();
        return;
    }

    // Si la ruta existe y pasa las guardias, renderizar
    if (route) {
        app.innerHTML = route.renderView();
        if (route.afterRender) {
            route.afterRender();
        }
    } else {
        // Ruta no encontrada (y asegurar que header/footer estén visibles aquí si es una 404 general)
        app.innerHTML = show404();
        if (header) header.style.display = "flex"; // Mostrar header/footer si la 404 no es parte de login/register
        if (footer) footer.style.display = "block";
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
    // Añadir lógica para el botón de logout aquí si no está ya en afterRender
    if (target.matches(".logout-button")) {
        // Lógica para cerrar sesión (ej. limpiar localStorage, redirigir a /login)
        localStorage.removeItem("user");
        history.pushState({}, "", "/login");
        router();
    }
});

// Renderizar la ruta inicial al cargar la página
document.addEventListener("DOMContentLoaded", () => {
    router();
});