import axios from "axios";
import { login, register, logout } from "./controllers/outh.js"; // Asegúrate de que este path sea correcto

// --- Definiciones de Rutas ---
const routes = {
  // Las rutas deben ser relativas a la raíz del servidor de desarrollo.
  // Si tu index.html principal de Vite/dev está en la raíz de 'frontend',
  // y tus vistas están en 'frontend/src/views', entonces la ruta correcta es '/src/views/...'
  // Si estás sirviendo 'src' directamente, podría ser solo '/views/...'
  // Lo más común en un setup con Vite es que si tu index.html principal está en la raíz de 'frontend',
  // y dentro de 'frontend' tienes una carpeta 'src', entonces las rutas relativas a 'src' son:
  "/": { html: "/src/views/index.html", css: "/src/stilos/index.css" },
  "/login": { html: "/src/views/login.html", css: "/src/stilos/login.css" },
  "/register": { html: "/src/views/register.html", css: "/src/stilos/register-styles.css" },
  "/notFound": { html: "/src/views/404.html", css: "/src/stilos/404-styles.css" },
};

// URL para json-server. ¡IMPORTANTE! Asegúrate que tu json-server corre en el puerto 3004.
// Y que tu db.json tiene "users", "trabajadores", y "registros".
const API_URL = "http://localhost:3004";
let trabajadores = [];
let lista; // Declarada globalmente, se asigna cuando el elemento está presente

// --- Función auxiliar para cargar CSS ---
function loadCSS(href) {
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = href;

  // Elimina cualquier hoja de estilo cargada previamente para evitar conflictos
  const existingLink = document.querySelector('link[rel="stylesheet"][data-route-style]');
  if (existingLink) {
    existingLink.remove();
  }
  link.setAttribute('data-route-style', 'true'); // Marca esto como un estilo específico de la ruta
  document.head.appendChild(link);
}

// --- Función de Renderizado de Ruta Principal ---
export async function renderRoute() {
  const path = location.pathname;
  const app = document.getElementById("app");
  // Asegúrate que localStorage.getItem("isAuth") se compara con el string "true"
  const isAuth = localStorage.getItem("isAuth") === "true";
  const currentUser = JSON.parse(localStorage.getItem("user"));

  console.log(`Intentando renderizar la ruta: ${path}, ¿Autenticado?: ${isAuth}`);

  // Lógica de Redirección (Guardias)
  // Caso 1: Si NO está autenticado y NO está en la página de login o registro
  if (!isAuth && path !== "/login" && path !== "/register") {
    console.log("Usuario no autenticado y no en página de acceso, redirigiendo a /login.");
    history.pushState({}, "", "/login");
    renderRoute(); // Vuelve a llamar para renderizar la página de inicio de sesión
    return; // Detiene la ejecución actual
  }

  // Caso 2: Si SÍ está autenticado y está intentando acceder a login o registro
  if (isAuth && (path === "/login" || path === "/register")) {
    console.log("Usuario autenticado intentando acceder a login/registro, redirigiendo a /.");
    history.pushState({}, "", "/");
    renderRoute();
    return; // Detiene la ejecución actual
  }

  // Si no se cumple ninguna de las condiciones anteriores,
  // significa que el usuario está autorizado para ver la ruta solicitada.
  const routeInfo = routes[path];
  if (!routeInfo) {
    console.log("Ruta no encontrada, redirigiendo a /notFound.");
    history.pushState({}, "", "/notFound");
    renderRoute();
    return;
  }

  try {
    // Usamos fetch aquí porque estamos obteniendo archivos HTML locales (no de la API de json-server)
    const response = await fetch(routeInfo.html);
    if (!response.ok) {
      throw new Error(`¡Error HTTP! Estado: ${response.status}`);
    }
    const html = await response.text();
    app.innerHTML = html;

    // Cargar el CSS específico para la ruta actual
    if (routeInfo.css) {
      loadCSS(routeInfo.css);
    }

    // --- Lógica posterior al renderizado específica de cada página ---
    if (path === "/login") {
      const loginForm = document.getElementById("loginForm");
      if (loginForm) {
        loginForm.addEventListener("submit", async (e) => {
          e.preventDefault();
          const email = loginForm.email.value;
          const password = loginForm.password.value;
          const success = await login({ email, password });

          if (success) {
            history.pushState({}, "", "/");
            renderRoute();
          }
        });
      } else {
        console.warn("Formulario de inicio de sesión (ID: 'loginForm') no encontrado en la página /login. Asegúrate de que login.html tenga <form id='loginForm'>.");
      }
    } else if (path === "/register") {
      const registerForm = document.getElementById("registerForm");
      if (registerForm) {
        registerForm.addEventListener("submit", async (e) => {
          e.preventDefault();
          const name = registerForm.fullname.value;
          const username = registerForm.username.value;
          const email = registerForm.registerEmail.value;
          const role = registerForm.role.value;
          const password = registerForm.registerPassword.value;
          const placa = registerForm.placa.value;

          const success = await register({ name, username, email, role, password, placa });

          if (success) {
            alert("¡Registro exitoso! Redirigiendo al inicio.");
            history.pushState({}, "", "/");
            renderRoute();
          }
        });
      } else {
        console.warn("El formulario de registro (ID: 'registerForm') no se encuentra en la página /register. Asegúrate de que register.html tenga <form id='registerForm'>.");
      }
    } else if (path === "/") {
      lista = document.getElementById("lista-registros");
      if (lista) {
        await cargarRegistros();

        const user = JSON.parse(localStorage.getItem("user"));
        const userNameSpan = document.getElementById("user-name"); // Asegúrate de tener este ID en index.html
        const adminSection = document.getElementById("admin-dashboard-section"); // Asegúrate de tener este ID en index.html
        // const userSection = document.getElementById("user-dashboard-section"); // Si tienes una sección separada para usuarios
        const logoutButton = document.getElementById("logout-button"); // Asegúrate de tener este ID en index.html

        if (userNameSpan && user && user.name) {
            userNameSpan.textContent = user.name;
        }

        if (user && user.role === "admin") {
            if (adminSection) adminSection.style.display = 'block';
            console.log("Administrador inició sesión. Mostrando funciones de administración.");
        } else {
            if (adminSection) adminSection.style.display = 'none';
            console.log("Usuario inició sesión. Mostrando funciones de usuario habituales.");
        }

        if (logoutButton) {
            logoutButton.addEventListener('click', () => {
                logout();
                history.pushState({}, "", "/login");
                renderRoute();
            });
        }

      } else {
        console.warn("Elemento con ID 'lista-registros' no encontrado en la página principal.");
      }
    }
  } catch (error) {
    console.error("Error cargando ruta o contenido:", error);
    history.pushState({}, "", "/notFound");
    renderRoute();
  }
}

// --- Funciones de Carga de Datos (Usando Axios) ---
async function cargarTrabajadores() {
  try {
    // ¡CORREGIDO! La URL correcta para obtener trabajadores es ${API_URL}/trabajadores
    const res = await axios.get(`${API_URL}/trabajadores`);
    trabajadores = res.data; // Axios pone los datos directamente en .data
  } catch (error) {
    console.error("Error cargando trabajadores:", error);
  }
}

async function cargarRegistros() {
  await cargarTrabajadores(); // Asegura que los trabajadores se carguen primero

  try {
    const res = await axios.get(`${API_URL}/registros`); // Usando axios.get
    const data = res.data; // Axios pone los datos directamente en .data

    if (lista) { // Asegúrate de que lista exista antes de intentar manipular su innerHTML
      lista.innerHTML = "";

      data.forEach((registro) => {
        // ¡CORREGIDO! Usar el array 'trabajadores' que se cargó, no 'administrador'
        const trabajador = trabajadores.find(
          (t) => t.placa.toUpperCase() === registro.placa.toUpperCase()
        );
        const nombre = trabajador ? trabajador.nombre : null;

        const div = document.createElement("div");
        div.className = "registro";

        const entrada = new Date(registro.entrada);
        const salida = registro.salida ? new Date(registro.salida) : null;

        let tiempoTexto = "—";
        let valorTexto = "—";

        if (salida) {
          const minutos = Math.floor((salida - entrada) / 60000);
          const horas = Math.ceil(minutos / 60);
          // Calcula el valor. Si es trabajador, 500 por hora; si no, 3000.
          const valor = trabajador ? horas * 500 : horas * 3000;

          tiempoTexto = `${minutos} minutos`;
          valorTexto = `$${valor}`; // Formato de moneda
        }

        div.innerHTML = `
          ${
            trabajador
              ? `<div class="etiqueta-trabajador">Trabajador: ${nombre}</div><br>` // Añadido <br> para espacio
              : ""
          }
          <strong>Placa:</strong> ${registro.placa}<br>
          <strong>Entrada:</strong> ${entrada.toLocaleString()}<br>
          <strong>Salida:</strong> ${salida ? salida.toLocaleString() : "—"}<br>
          <strong>Tiempo:</strong> ${tiempoTexto}<br>
          <strong>Valor:</strong> ${valorTexto}<br>
        `;

        if (!registro.salida) {
          const btn = document.createElement("button");
          btn.textContent = "Marcar salida";
          btn.setAttribute('data-registro-id', registro.id);
          btn.classList.add('marcar-salida-btn');
          div.appendChild(btn);
        }

        lista.appendChild(div);
      });
    }
  } catch (error) {
    console.error("Error cargando registros:", error);
  }
}

async function marcarSalida(id) {
  const salida = new Date().toISOString();

  try {
    const res = await axios.patch(`${API_URL}/registros/${id}`, { salida: salida }, {
      headers: { "Content-Type": "application/json" }
    });

    if (res.status === 200) { // Axios devuelve 200 OK para PATCH exitoso
      cargarRegistros(); // Recargar datos después de una actualización exitosa
    } else {
        throw new Error(`¡Error HTTP! Estado: ${res.status}`);
    }
  } catch (error) {
    console.error("Error al marcar la hora de salida:", error);
  }
}

// --- Escuchadores de Eventos para Enrutamiento del Lado del Cliente ---

// 1. Escucha los botones de avance/retroceso del navegador
window.addEventListener("popstate", renderRoute);

// 2. Intercepta todos los clics en enlaces internos y el botón "Marcar salida"
document.addEventListener("click", (e) => {
  const { target } = e;
  // Si el objetivo es un enlace y es un enlace interno (de tu misma aplicación)
  if (target.matches("a") && target.origin === window.location.origin) {
    e.preventDefault(); // Detener la navegación predeterminada del navegador
    history.pushState({}, "", target.href); // Actualizar URL en el historial del navegador
    renderRoute(); // Renderiza la nueva ruta
  } else if (target.closest('.marcar-salida-btn')) { // Delegación de evento para el botón "Marcar salida"
    const button = target.closest('.marcar-salida-btn');
    const registroId = button.getAttribute('data-registro-id');
    if (registroId) {
      marcarSalida(registroId);
    }
  }
});

// --- Llamadas Iniciales ---
document.addEventListener("DOMContentLoaded", () => {
  renderRoute(); // Renderizado de la ruta inicial cuando el DOM está listo
});
