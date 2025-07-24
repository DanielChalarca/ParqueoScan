import { router } from "../../frontend/src/router"; // Importa el router para usar history.pushState y router()

const API_URL = "http://localhost:3000"; // Consistente

let trabajadores = []; // Variable global para trabajadores

// Función para cargar trabajadores (común a ambos dashboards)
async function cargarTrabajadores() {
    try {
        const res = await fetch(`${API_URL}/trabajadores`);
        if (!res.ok) throw new Error("Error al cargar trabajadores.");
        trabajadores = await res.json();
    } catch (error) {
        console.error("Error cargando trabajadores:", error);
        // Podrías mostrar un mensaje en la UI si lo deseas
    }
}

// --- Dashboard para ADMINISTRADOR ---
export function adminDashboardSettings() {
    const logoutButton = document.getElementById("logout-button");
    const lista = document.getElementById("lista-registros"); // Asumiendo este ID para el admin dashboard

    if (logoutButton) {
        logoutButton.addEventListener("click", (event) => {
            event.preventDefault();
            localStorage.removeItem("user"); // Consistente con localStorage.setItem("user")
            history.pushState({}, "", "/login");
            router(); // Renderiza la vista de login
        });
    }

    // Asegúrate de que el nombre del admin se muestre si tienes un span con ID "admin-name"
    const currentUser = JSON.parse(localStorage.getItem("user"));
    const adminNameSpan = document.getElementById("admin-name");
    if (adminNameSpan && currentUser && currentUser.nombre) {
        adminNameSpan.textContent = currentUser.nombre;
    }

    // Función para cargar TODOS los registros (solo para admin)
    async function cargarRegistrosAdmin() {
        await cargarTrabajadores(); // Asegura que los trabajadores estén cargados

        try {
            const res = await fetch(`${API_URL}/registros`);
            if (!res.ok) throw new Error("Error al obtener registros para admin.");
            const data = await res.json();

            if (lista) {
                lista.innerHTML = ""; // Limpiar la lista antes de añadir
                data.forEach((registro) => {
                    const trabajador = trabajadores.find(t => t.placa.toUpperCase() === registro.placa.toUpperCase());
                    const nombreTrabajador = trabajador ? trabajador.nombre : null;
                    
                    const div = document.createElement("div");
                    div.className = "registro"; // Clase CSS para cada registro de admin

                    const entrada = new Date(registro.entrada);
                    const salida = registro.salida ? new Date(registro.salida) : null;

                    let tiempoTexto = "—";
                    let valorTexto = "—";

                    if (salida) {
                        const minutos = Math.floor((salida - entrada) / 60000);
                        const horas = Math.ceil(minutos / 60);
                        // Lógica de valor para registros en general (admin view)
                        const valor = trabajador ? horas * 500 : horas * 3000;
                        
                        tiempoTexto = `${minutos} minutos`;
                        valorTexto = `$${valor}`;
                    }

                    div.innerHTML = `
                        ${nombreTrabajador ? `<div class="etiqueta-trabajador">Trabajador: ${nombreTrabajador}</div><br>` : ""}
                        <strong>Placa:</strong> ${registro.placa}<br>
                        <strong>Entrada:</strong> ${entrada.toLocaleString()}<br>
                        <strong>Salida:</strong> ${salida ? salida.toLocaleString() : "—"}<br>
                        <strong>Tiempo:</strong> ${tiempoTexto}<br>
                        <strong>Valor:</strong> ${valorTexto}<br>
                    `;

                    if (!registro.salida) {
                        const btn = document.createElement("button");
                        btn.textContent = "Marcar salida";
                        btn.classList.add("marcar-salida-btn"); // Clase para delegación de eventos
                        btn.setAttribute('data-registro-id', registro.id); // Almacena el ID para marcar salida
                        div.appendChild(btn);
                    }
                    lista.appendChild(div);
                });
            }
        } catch (error) {
            console.error("Error cargando registros para admin:", error);
            if (lista) lista.innerHTML = "<p>Error al cargar los registros.</p>";
        }
    }

    // Función para marcar salida (solo para admin)
    async function marcarSalida(id) {
        const salida = new Date().toISOString();
        try {
            const res = await fetch(`${API_URL}/registros/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ salida: salida }),
            });
            if (res.ok) {
                cargarRegistrosAdmin(); // Recargar registros después de marcar salida
            } else {
                throw new Error("Error al marcar salida.");
            }
        } catch (error) {
            console.error("Error al marcar la hora de salida:", error);
            alert("No se pudo marcar la salida. Intenta de nuevo.");
        }
    }

    // Inicializar la carga de registros para el admin
    cargarRegistrosAdmin();

    // Event listener delegado para los botones de marcar salida (dentro del admin dashboard)
    if (lista) { // Asegúrate de que el contenedor de la lista existe
        lista.addEventListener('click', (e) => {
            if (e.target.classList.contains('marcar-salida-btn')) {
                const registroId = e.target.getAttribute('data-registro-id');
                if (registroId) {
                    marcarSalida(registroId);
                }
            }
        });
    }
}


// --- Dashboard para USUARIO NORMAL ---
export function userDashboardSettings() {
    const logoutButton = document.getElementById("logout-button"); // Nuevo ID para el botón de logout del user dashboard
    const userLista = document.getElementById("user-lista-registros"); // Asumiendo este ID para el user dashboard

    if (logoutButton) {
        logoutButton.addEventListener("click", (event) => {
            event.preventDefault();
            localStorage.removeItem("user"); // Consistente
            history.pushState({}, "", "/login");
            router(); // Renderiza la vista de login
        });
    }

    const payButton = document.querySelector(".pay-button");
    if (payButton) {
        payButton.addEventListener("click", () => {
            history.pushState({}, "", "/payment-options"); // Navega a la nueva ruta
            router(); // Ejecuta el router para renderizar la vista de pago
        });
    }

    const currentUser = JSON.parse(localStorage.getItem("user"));
    const userNameSpan = document.getElementById("user-name"); // Asumiendo este ID para el nombre de usuario
    if (userNameSpan && currentUser && currentUser.nombre) {
        userNameSpan.textContent = currentUser.nombre;
    }

    if (!currentUser || !currentUser.placa) {
        if (userLista) userLista.innerHTML = "<p>No se pudo cargar tu historial de parqueo. Asegúrate de tener una placa registrada en tu perfil.</p>";
        return;
    }

    const userPlaca = currentUser.placa.toUpperCase();

    // Función para cargar registros específicos del usuario
    async function cargarRegistrosUsuario() {
        await cargarTrabajadores(); // Carga los trabajadores para la lógica de tarifa

        try {
            // Filtrar los registros por la placa del usuario logueado
            const res = await fetch(`${API_URL}/registros?placa=${userPlaca}`);
            if (!res.ok) throw new Error("Error al obtener registros de usuario.");
            const userRecords = await res.json();

            if (userLista) {
                userLista.innerHTML = ""; // Limpiar antes de agregar
                if (userRecords.length === 0) {
                    userLista.innerHTML = "<p>No tienes registros de parqueo aún.</p>";
                    return;
                }

                userRecords.forEach((registro) => {
                    const div = document.createElement("div");
                    div.className = "registro-usuario"; // Clase CSS específica para usuario

                    const entrada = new Date(registro.entrada);
                    const salida = registro.salida ? new Date(registro.salida) : null;

                    let tiempoTexto = "—";
                    let valorTexto = "—";

                    if (salida) {
                        const minutos = Math.floor((salida - entrada) / 60000);
                        const horas = Math.ceil(minutos / 60);
                        // Lógica de valor:
                        // Si el usuario es un trabajador y su placa coincide con un trabajador registrado
                        const isUserWorker = trabajadores.some(t => t.placa.toUpperCase() === userPlaca);
                        
                        const valor = isUserWorker ? horas * 500 : horas * 3000;
                        
                        tiempoTexto = `${minutos} minutos`;
                        valorTexto = `$${valor}`;
                    }

                    div.innerHTML = `
                        <p><strong>Placa:</strong> <span class="data-value">${registro.placa}</span></p>
                        <p><strong>Entrada:</strong> <span class="data-value">${entrada.toLocaleString()}</span></p>
                        <p><strong>Salida:</strong> <span class="data-value">${salida ? salida.toLocaleString() : "—"}</span></p>
                        <p><strong>Tiempo:</strong> <span class="data-value">${tiempoTexto}</span></p>
                        <p><strong>Valor:</strong> <span class="data-value">${valorTexto}</span></p>
                    `;
                    userLista.appendChild(div);
                });
            }
        } catch (error) {
            console.error("Error cargando registros para usuario:", error);
            if (userLista) userLista.innerHTML = "<p>Error al cargar tus registros. Intenta de nuevo más tarde.</p>";
        }
    }

    // Inicializar la carga de registros para el usuario
    cargarRegistrosUsuario();
}

export function adminDashboardWorkersSettings() {
    const API_URL = 'http://localhost:3000/trabajadores';

    // Referencias a elementos del DOM
    const logoutButton = document.getElementById("logout-button");
    const registroForm = document.getElementById('registro-form');
    const nameInput = document.getElementById('name');
    const placaInput = document.getElementById('placa');
    const passwordInput = document.getElementById('password');
    const registerButton = document.getElementById('register-button');
    const listaTrabajadoresDiv = document.getElementById('lista-trabajadores');
    // Las referencias al modal de confirmación han sido eliminadas

    let currentEditingId = null; // Para rastrear qué registro se está editando

    const currentUser = JSON.parse(localStorage.getItem("user"));
    const adminNameSpan = document.getElementById("admin-name");
    if (adminNameSpan && currentUser && currentUser.nombre) {
        adminNameSpan.textContent = currentUser.nombre;
    }

    if (logoutButton) {
        logoutButton.addEventListener("click", (event) => {
            event.preventDefault();
            localStorage.removeItem("user"); // Consistente con localStorage.setItem("user")
            history.pushState({}, "", "/login");
            router(); // Renderiza la vista de login
        });
    }

    // --- Funciones CRUD ---

    /**
     * Obtiene todos los trabajadores de la API.
     */
    async function getTrabajadores() {
        try {
            listaTrabajadoresDiv.innerHTML = '<h4>Registros Actuales</h4><p class="no-records-message">Cargando todos los registros...</p>';
            const response = await fetch(API_URL);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const trabajadores = await response.json();
            renderTrabajadores(trabajadores);
        } catch (error) {
            console.error("Error al obtener trabajadores:", error);
            listaTrabajadoresDiv.innerHTML = '<h4>Registros Actuales</h4><p class="error-message">Error al cargar los registros. Asegúrate de que json-server esté ejecutándose.</p>';
        }
    }

    /**
     * Renderiza la lista de trabajadores en el DOM.
     * @param {Array} trabajadores - Array de objetos de trabajadores.
     */
    function renderTrabajadores(trabajadores) {
        listaTrabajadoresDiv.innerHTML = '<h4>Registros Actuales</h4>';
        if (trabajadores.length === 0) {
            listaTrabajadoresDiv.innerHTML += '<p class="no-records-message">No hay registros de parqueo. ¡Añade uno!</p>';
            return;
        }

        const ul = document.createElement('ul');
        ul.className = 'registros-list';

        trabajadores.forEach(trabajador => {
            const li = document.createElement('li');
            li.className = 'registro';
            li.dataset.id = trabajador.id; // Guarda el ID en el dataset

            li.innerHTML = `
                    <div class="registro-info">
                        <p><strong>ID:</strong> ${trabajador.id}</p>
                        <p><strong>Nombre:</strong> ${trabajador.nombre}</p>
                        <p><strong>Placa:</strong> ${trabajador.placa}</p>
                        <p><strong>Contraseña:</strong> ${trabajador.contraseña ? '********' : 'N/A'}</p>
                    </div>
                    <div class="registro-actions">
                        <button class="action-button edit-button" data-id="${trabajador.id}">Editar</button>
                        <button class="action-button delete-button" data-id="${trabajador.id}">Eliminar</button>
                    </div>
                `;
            ul.appendChild(li);
        });
        listaTrabajadoresDiv.appendChild(ul);
    }

    // Las funciones openDeleteModal y closeDeleteModal han sido eliminadas

    // --- Manejadores de Eventos ---

    // Manejador para el envío del formulario (Crear/Actualizar)
    registroForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const nombre = nameInput.value.trim();
        const placa = placaInput.value.trim();
        const contraseña = passwordInput.value.trim();

        if (!nombre || !placa || !contraseña) {
            console.warn("Todos los campos son obligatorios.");
            return;
        }

        const trabajadorData = {
            nombre: nombre,
            placa: placa,
            contraseña: contraseña
        };

        try {
            let response;
            if (currentEditingId) {
                // Modo Actualizar (PUT)
                response = await fetch(`${API_URL}/${currentEditingId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(trabajadorData)
                });
                console.log("Registro actualizado con ID:", currentEditingId);
                currentEditingId = null;
                registerButton.textContent = 'Entrar';
                registerButton.classList.remove('update-button-style');
            } else {
                // Modo Crear (POST)
                response = await fetch(API_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(trabajadorData)
                });
                const newTrabajador = await response.json();
                console.log("Nuevo registro añadido con ID:", newTrabajador.id);
            }

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            getTrabajadores();
            registroForm.reset();

        } catch (e) {
            console.error("Error al añadir/actualizar el documento: ", e);
            alert("Hubo un error al guardar el registro. Por favor, inténtalo de nuevo.");
        }
    });

    // Manejador para los botones de Editar y Eliminar (delegación de eventos)
    listaTrabajadoresDiv.addEventListener('click', async (e) => {
        const target = e.target;
        const id = target.dataset.id;

        if (target.classList.contains('edit-button')) {
            try {
                const response = await fetch(`${API_URL}/${id}`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const trabajadorToEdit = await response.json();

                nameInput.value = trabajadorToEdit.nombre;
                placaInput.value = trabajadorToEdit.placa;
                passwordInput.value = trabajadorToEdit.contraseña;
                currentEditingId = id;
                registerButton.textContent = 'Actualizar';
                registerButton.classList.add('update-button-style');
            } catch (error) {
                console.error("Error al preparar la edición:", error);
                alert("No se pudo cargar el registro para edición. Por favor, inténtalo de nuevo.");
            }

        } else if (target.classList.contains('delete-button')) {
            // Lógica para Eliminar con confirm()
            if (confirm('¿Estás seguro de que quieres eliminar este registro?')) {
                try {
                    const response = await fetch(`${API_URL}/${id}`, {
                        method: 'DELETE'
                    });
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    console.log("Registro eliminado con ID:", id);
                    getTrabajadores();
                } catch (error) {
                    console.error("Error al eliminar el documento:", error);
                    alert("Hubo un error al eliminar el registro. Por favor, inténtalo de nuevo.");
                }
            }
        }
    });

    // Los manejadores para confirmDeleteBtn y cancelDeleteBtn han sido eliminados

    // Carga inicial de los trabajadores al cargar la página
    getTrabajadores();
}