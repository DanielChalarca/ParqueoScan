// C:/Users/ASUS/OneDrive/Documentos/GitHub/ParqueoScan/backend/controllers/authSettings.js
// La ruta de importación de router.js DEBE SER:
// '../../frontend/src/router.js' si router.js está en frontend/src/router.js
// y este archivo (authSettings.js) está en backend/controllers/authSettings.js
import { router } from "../../frontend/src/router.js"; 

const API_URL = "http://localhost:3000";

export function loginSettings() {
    const buttonLogin = document.getElementById("login-button");
    const inputPlaca = document.getElementById("placa");
    const inputPassword = document.getElementById("password");

    buttonLogin.addEventListener("click", async (event) => {
        event.preventDefault();

        const placa = inputPlaca.value.toUpperCase().replace(/\s/g, "");
        const password = inputPassword.value;

        try {
            let authenticatedUser = null;
            let userRole = null;

            // 1. Intentar autenticar como TRABAJADOR (Administrador)
            const trabajadoresResponse = await fetch(`${API_URL}/trabajadores?placa=${placa}&contraseña=${password}`);
            if (!trabajadoresResponse.ok) throw new Error("Error al buscar trabajadores.");
            const trabajadores = await trabajadoresResponse.json();

            if (trabajadores.length > 0) {
                authenticatedUser = trabajadores[0];
                userRole = "admin"; // Si se encuentra en trabajadores, es un admin
            } else {
                // 2. Si no es trabajador, intentar autenticar como USUARIO NORMAL
                const usersResponse = await fetch(`${API_URL}/users?placa=${placa}&contraseña=${password}`);
                if (!usersResponse.ok) throw new Error("Error al buscar usuarios.");
                const users = await usersResponse.json();

                if (users.length > 0) {
                    authenticatedUser = users[0];
                    userRole = "user"; // Si se encuentra en users, es un usuario normal
                }
            }

            if (authenticatedUser && userRole) {
                // Guarda el OBJETO COMPLETO del usuario y su rol determinado
                // Le añadimos la propiedad 'role' antes de guardarlo en localStorage para el router
                authenticatedUser.role = userRole; 
                localStorage.setItem("user", JSON.stringify(authenticatedUser));
                alert(`Bienvenido, ${authenticatedUser.nombre}!`);
                
                // Redirige según el rol determinado
                if (userRole === "admin") {
                    history.pushState({}, "", "/dashboard-admin");
                } else {
                    history.pushState({}, "", "/dashboard-user");
                }
                router(); // Llama al router para renderizar la nueva vista SPA
            } else {
                alert("Credenciales incorrectas. Placa o contraseña no válidos.");
            }
        } catch (error) {
            console.error("Error en login:", error);
            alert("Ocurrió un error al iniciar sesión. Intenta de nuevo más tarde.");
        }
    });
}

export function registerSettings() {
    const registerButton = document.getElementById("register-button");
    const inputName = document.getElementById("name");
    const inputPlaca = document.getElementById("placa");
    const inputPassword = document.getElementById("password");

    registerButton.addEventListener("click", async (event) => {
        event.preventDefault();

        const name = inputName.value;
        const placa = inputPlaca.value.toUpperCase().replace(/\s/g, '');
        const password = inputPassword.value;

        try {
            // VERIFICACIÓN: Revisa si la placa ya existe como usuario O como trabajador/admin
            const checkUserResponse = await fetch(`${API_URL}/users?placa=${placa}`);
            const existingUsers = await checkUserResponse.json();

            const checkTrabajadorResponse = await fetch(`${API_URL}/trabajadores?placa=${placa}`);
            const existingTrabajadores = await checkTrabajadorResponse.json();

            if (existingUsers.length > 0 || existingTrabajadores.length > 0) {
                alert("Esta placa ya está registrada como usuario o como trabajador.");
                return;
            }

            // Si no existe, registra como USUARIO NORMAL
            const newUser = {
                id: Date.now().toString(), // Genera un ID único simple
                nombre: name,
                placa: placa,
                contraseña: password,
                // No necesitamos 'role' aquí, ya que el login lo determina por el endpoint
            };

            const response = await fetch(`${API_URL}/users`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(newUser)
            });
            
            if (!response.ok) throw new Error("Error al registrar usuario.");
            
            const registeredUser = await response.json();
            alert(`Registro exitoso para ${registeredUser.nombre}! Ahora puedes iniciar sesión.`);
            
            history.pushState({}, "", "/login"); // Redirige al login
            router(); // Renderiza la vista de login
        } catch (error) {
            console.error("Error en registro:", error);
            alert("Ocurrió un error al registrar el usuario. Intenta de nuevo más tarde.");
        }
    });
}