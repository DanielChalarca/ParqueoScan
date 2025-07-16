import { getUsers, updateUser, deleteUser } from "./controllers/crudEmployees";
import { login } from "./controllers/login";
import { register } from "./controllers/register";
import { getEvents, inscribirUsuario, eliminarInscripcion, createEvent, updateEvent, deleteEvent } from "./controllers/events";

const routes = {
  "/": "/src/views/home.html",
  "/employee": "/src/views/managmentEmployee.html",
  "/login": "/src/views/login.html",
  "/register": "/src/views/register.html",
  "/home": "/src/views/home.html",
  "/notFound": "/src/views/404.html",
  "/events-admin": "/src/views/home.html",
  "/events": "/src/views/events.html",
};

// Objeto para almacenar manejadores de eventos y evitar duplicados
const eventListeners = {};

export async function renderRoute() {
  const user = JSON.parse(localStorage.getItem("user"));
  const path = location.pathname;
  const app = document.getElementById("app");
  const isAuth = localStorage.getItem("isAuth");

  // Guard: Proteger rutas según el estado de autenticación
  if (!isAuth && path !== "/login" && path !== "/register") {
    console.log("Usuario no autenticado, redirigiendo a /login");
    history.pushState({}, "", "/login");
    renderRoute();
    return;
  }

  if (isAuth && (path === "/login" || path === "/register")) {
    console.log("Usuario autenticado, redirigiendo a /");
    history.pushState({}, "", "/");
    renderRoute();
    return;
  }

  const file = routes[path];
  if (!file) {
    console.log("Ruta no encontrada, redirigiendo a /notFound");
    history.pushState({}, "", "/notFound");
    renderRoute();
    return;
  }

  try {
    console.log("Cargando archivo:", file);
    const res = await fetch(file);
    if (!res.ok) throw new Error(`No se pudo cargar ${file}`);
    const html = await res.text();
    app.innerHTML = html;

    const header = document.getElementById("principal-header");
    if (header) {
      header.hidden = path === "/login" || path === "/register";
      const eventsLink = header.querySelector("a[href='/events-admin']");
      if (eventsLink && user) {
        if (user.role === "admin") {
          eventsLink.href = "/events-admin";
          eventsLink.textContent = "Administración de Eventos";
        } else {
          eventsLink.href = "/events";
          eventsLink.textContent = "Eventos";
        }
      }
    }

    if (path === "/employee") {
      console.log("Configurando ruta /employee");
      const users = await getUsers();
      fillTable(users, false, user.role === "admin");
      setupEmployeeRouteEvents(user.role === "admin");
    }

    if (path === "/events") {
      console.log("Configurando ruta /events");
      if (user && user.role === "admin") {
        history.pushState({}, "", "/events-admin");
        await renderRoute();
        return;
      }
      const events = await getEvents();
      const tbody = document.getElementById("event-table-body");
      if (tbody) {
        tbody.innerHTML = "";
        events.forEach((event) => {
          const isInscrito = event.inscritos.includes(user.id);
          const row = document.createElement("tr");
          row.innerHTML = `
            <td class="p-2">${event.title}</td>
            <td class="p-2">${event.capacity}</td>
            <td class="p-2">${event.inscritos.length}</td>
            <td class="p-2">
              ${!isInscrito ? `<button class="btn-inscribir bg-blue-500 text-white p-1 rounded hover:bg-blue-600" data-id="${event.id}">Inscribirse</button>` : ''}
              ${isInscrito ? `<button class="btn-eliminar-inscripcion bg-red-500 text-white p-1 rounded hover:bg-red-600" data-id="${event.id}">Eliminar inscripción</button>` : ''}
            </td>
          `;
          tbody.appendChild(row);
        });

        document.querySelectorAll(".btn-inscribir").forEach((btn) => {
          btn.addEventListener("click", async () => {
            const eventId = btn.dataset.id;
            const success = await inscribirUsuario(eventId, user.id);
            if (success) {
              alert("Inscripción exitosa");
              const updatedEvents = await getEvents();
              tbody.innerHTML = "";
              updatedEvents.forEach((event) => {
                const isInscrito = event.inscritos.includes(user.id);
                const row = document.createElement("tr");
                row.innerHTML = `
                  <td class="p-2">${event.title}</td>
                  <td class="p-2">${event.capacity}</td>
                  <td class="p-2">${event.inscritos.length}</td>
                  <td class="p-2">
                    ${!isInscrito ? `<button class="btn-inscribir bg-blue-500 text-white p-1 rounded hover:bg-blue-600" data-id="${event.id}">Inscribirse</button>` : ''}
                    ${isInscrito ? `<button class="btn-eliminar-inscripcion bg-red-500 text-white p-1 rounded hover:bg-red-600" data-id="${event.id}">Eliminar inscripción</button>` : ''}
                  </td>
                `;
                tbody.appendChild(row);
              });
            }
          });
        });

        document.querySelectorAll(".btn-eliminar-inscripcion").forEach((btn) => {
          btn.addEventListener("click", async () => {
            const eventId = btn.dataset.id;
            const success = await eliminarInscripcion(eventId, user.id);
            if (success) {
              const updatedEvents = await getEvents();
              tbody.innerHTML = "";
              updatedEvents.forEach((event) => {
                const isInscrito = event.inscritos.includes(user.id);
                const row = document.createElement("tr");
                row.innerHTML = `
                  <td class="p-2">${event.title}</td>
                  <td class="p-2">${event.capacity}</td>
                  <td class="p-2">${event.inscritos.length}</td>
                  <td class="p-2">
                    ${!isInscrito ? `<button class="btn-inscribir bg-blue-500 text-white p-1 rounded hover:bg-blue-600" data-id="${event.id}">Inscribirse</button>` : ''}
                    ${isInscrito ? `<button class="btn-eliminar-inscripcion bg-red-500 text-white p-1 rounded hover:bg-red-600" data-id="${event.id}">Eliminar inscripción</button>` : ''}
                  </td>
                `;
                tbody.appendChild(row);
              });
            }
          });
        });
      } else {
        console.error("Elemento event-table-body no encontrado");
      }
    }

    if (path === "/events-admin") {
      console.log("Configurando ruta /events-admin");
      if (!user || user.role !== "admin") {
        alert("Error: No eres administrador para agregar eventos");
        history.pushState({}, "", "/");
        await renderRoute();
        return;
      }
      const events = await getEvents();
      const tbody = document.getElementById("event-table-body");
      if (tbody) {
        tbody.innerHTML = "";
        events.forEach((event) => {
          const row = document.createElement("tr");
          row.innerHTML = `
            <td class="p-2">${event.title}</td>
            <td class="p-2">${event.capacity}</td>
            <td class="p-2">${event.inscritos.length}</td>
            <td class="p-2">
              <button class="btn-editar-evento bg-emerald-300 p-1 rounded hover:bg-emerald-500" data-id="${event.id}">Editar</button>
              <button class="btn-eliminar-evento bg-red-300 p-1 rounded hover:bg-red-500" data-id="${event.id}">Eliminar</button>
            </td>
          `;
          tbody.appendChild(row);
        });

        const form = document.getElementById("event-form");
        if (form) {
          form.addEventListener("submit", async (e) => {
            e.preventDefault();
            const id = document.getElementById("event-id").value;
            const title = document.getElementById("title").value;
            const capacity = parseInt(document.getElementById("capacity").value);

            if (!title || isNaN(capacity)) {
              alert("Por favor, completa todos los campos correctamente");
              return;
            }

            if (id) {
              await updateEvent(id, { title, capacity, inscritos: [] });
              alert("Evento actualizado con éxito");
            } else {
              await createEvent({ title, capacity });
              alert("Evento creado con éxito");
            }

            document.getElementById("event-form").reset();
            document.getElementById("event-id").value = "";
            const updatedEvents = await getEvents();
            tbody.innerHTML = "";
            updatedEvents.forEach((event) => {
              const row = document.createElement("tr");
              row.innerHTML = `
                <td class="p-2">${event.title}</td>
                <td class="p-2">${event.capacity}</td>
                <td class="p-2">${event.inscritos.length}</td>
                <td class="p-2">
                  <button class="btn-editar-evento bg-emerald-300 p-1 rounded hover:bg-emerald-500" data-id="${event.id}">Editar</button>
                  <button class="btn-eliminar-evento bg-red-300 p-1 rounded hover:bg-red-500" data-id="${event.id}">Eliminar</button>
                </td>
              `;
              tbody.appendChild(row);
            });
          });
        }

        document.querySelectorAll(".btn-editar-evento").forEach((btn) => {
          btn.addEventListener("click", async () => {
            const id = btn.dataset.id;
            const events = await getEvents();
            const event = events.find((e) => e.id === id);
            if (event) {
              document.getElementById("event-id").value = event.id;
              document.getElementById("title").value = event.title;
              document.getElementById("capacity").value = event.capacity;
            }
          });
        });

        document.querySelectorAll(".btn-eliminar-evento").forEach((btn) => {
          btn.addEventListener("click", async () => {
            const id = btn.dataset.id;
            if (confirm("¿Estás seguro de eliminar este evento?")) {
              await deleteEvent(id);
              const updatedEvents = await getEvents();
              tbody.innerHTML = "";
              updatedEvents.forEach((event) => {
                const row = document.createElement("tr");
                row.innerHTML = `
                  <td class="p-2">${event.title}</td>
                  <td class="p-2">${event.capacity}</td>
                  <td class="p-2">${event.inscritos.length}</td>
                  <td class="p-2">
                    <button class="btn-editar-evento bg-emerald-300 p-1 rounded hover:bg-emerald-500" data-id="${event.id}">Editar</button>
                    <button class="btn-eliminar-evento bg-red-300 p-1 rounded hover:bg-red-500" data-id="${event.id}">Eliminar</button>
                  </td>
                `;
                tbody.appendChild(row);
              });
              alert("Evento eliminado con éxito");
            }
          });
        });
      } else {
        console.error("Elemento event-table-body no encontrado");
      }
    }

    if (path === "/login") {
      console.log("Configurando ruta /login");
      document.getElementById("principal-header").hidden = true;
      document.getElementById("loginForm")?.addEventListener("submit", (e) => {
        e.preventDefault();
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;

        const params = { email, password };
        login(params).then((success) => {
          if (success) {
            history.pushState({}, "", "/");
            renderRoute();
          } else {
            alert("Inicio de sesión fallido. Verifica tus credenciales.");
          }
        });
      });

      document.getElementById("registerBtn")?.addEventListener("click", () => {
        console.log("Navegando a /register desde el botón");
        history.pushState({}, "", "/register");
        renderRoute();
      });
    }

    if (path === "/register") {
      console.log("Configurando ruta /register");
      document.getElementById("principal-header").hidden = true;
      const registerForm = document.getElementById("registerForm");
      if (!registerForm) {
        console.error("Formulario de registro no encontrado");
        return;
      }
      registerForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        console.log("Formulario de registro enviado");
        const name = document.getElementById("fullname").value;
        const username = document.getElementById("username").value;
        const email = document.getElementById("registerEmail").value;
        const role = document.getElementById("role").value;
        const password = document.getElementById("registerPassword").value;

        const success = await register({ name, username, email, role, password });
        if (success) {
          history.pushState({}, "", "/");
          renderRoute();
        } else {
          alert("El registro falló. Por favor, intenta de nuevo.");
        }
      });
    }

    if (path === "/") {
      console.log("Configurando ruta /");
      if (user && user.role === "admin") {
        app.innerHTML = `
          <div class="text-center">
            <span class="text-4xl font-bold">Welcome, ${user.name}</span>
          </div>
          <div class="container grid grid-cols-2 space-x-4 p-3">
            <a href="/events-admin">
              <div class="card bg-green-300 h-24 w-full rounded-lg p-3">Eventos (Admin)</div>
            </a>
            <a href="/employee">
              <div class="card bg-blue-300 h-24 w-full rounded-lg p-3">Registered Staff</div>
            </a>
          </div>`;
      } else {
        app.innerHTML = `
          <div class="text-center">
            <span class="text-4xl font-bold">Welcome, ${user.name}</span>
          </div>
          <div class="container grid grid-cols-2 space-x-4 p-3">
            <a href="/events">
              <div class="card bg-green-200 h-24 w-full rounded-lg p-3">Eventos</div>
            </a>
            <a href="/employee">
              <div class="card bg-blue-200 h-24 w-full rounded-lg p-3">Registered Staff</div>
            </a>
          </div>`;
      }
    }

    if (path === "/notFound") {
      console.log("Configurando ruta /notFound");
      document.getElementById("principal-header").hidden = false;
    }

    document.getElementById("logOut")?.addEventListener("click", () => {
      localStorage.removeItem("user");
      localStorage.removeItem("isAuth");
      history.pushState({}, "", "/login");
      renderRoute();
    });
  } catch (error) {
    console.error("Error al cargar la ruta:", error);
    app.innerHTML = "<h2>Error al cargar la vista</h2>";
  }
}

function searchData(campo, data) {
  console.log("Buscando con campo:", campo, "en datos:", data);
  return data.filter(
    (item) =>
      (item.id && item.id.toString().toLowerCase().includes(campo.toLowerCase())) ||
      (item.name && item.name.toLowerCase().includes(campo.toLowerCase())) ||
      (item.lastname && item.lastname.toLowerCase().includes(campo.toLowerCase())) ||
      (item.email && item.email.toLowerCase().includes(campo.toLowerCase()))
  );
}

function fillTable(data, isSearch = false, isAdmin = false) {
  const tbody = document.querySelector("#table-employee tbody");
  if (!tbody) {
    console.error("Elemento tbody no encontrado en la tabla");
    return;
  }
  tbody.innerHTML = "";

  if (data.length === 0) {
    const fila = document.createElement("tr");
    fila.innerHTML = `<td colspan="${isAdmin ? 5 : 4}" class="text-center">${isSearch ? "Error usuario no encontrado" : "No hay usuarios para mostrar"}</td>`;
    tbody.appendChild(fila);
    return;
  }

  data.forEach((user) => {
    const fila = document.createElement("tr");
    fila.innerHTML = `
      <td class="text-center">${user.name}</td>
      <td class="text-center">${user.username}</td>
      <td class="text-center">${user.email}</td>
      <td class="text-center">${user.role}</td>
      ${isAdmin ? `
        <td class="text-center">
          <button class="btn-editar m-1 rounded p-1 bg-emerald-300 cursor-pointer hover:bg-emerald-500 shadow-md shadow-cyan-200" data-id="${user.id}">Editar</button>
          <button class="btn-eliminar m-1 rounded p-1 bg-red-300 cursor-pointer hover:bg-red-500" data-id="${user.id}">Eliminar</button>
        </td>
      ` : ''}
    `;
    tbody.appendChild(fila);
  });

  if (isAdmin) {
    setFunctions(tbody, "editar", ".btn-editar");
    setFunctions(tbody, "eliminar", ".btn-eliminar");
  }
}

function setFunctions(tabla, clave, clase) {
  tabla.querySelectorAll(clase).forEach((btn) => {
    btn.removeEventListener("click", eventListeners[clave]);
    btn.addEventListener("click", eventListeners[clave] = async () => {
      const id = btn.dataset.id;
      if (clave === "editar") {
        const users = await getUsers();
        const user = users.find((u) => u.id === id);
        if (user) {
          document.getElementById("grid-first-name").value = user.name;
          document.getElementById("grid-last-name").value = user.lastname;
          document.getElementById("grid-identification").value = user.email;
          document.getElementById("btn-container").hidden = false;
          document.getElementById("container-form").hidden = false;
          document.getElementById("edit-text").hidden = false;
          document.getElementById("edit-text").textContent = `Editando usuario: ${user.name}`;
          localStorage.setItem("editId", id);
        }
      } else if (clave === "eliminar") {
        const confirmDelete = confirm("¿Estás seguro de eliminar este usuario?");
        if (confirmDelete) {
          await deleteUser(id);
          const updatedUsers = await getUsers();
          fillTable(updatedUsers, false, true);
          alert("Usuario eliminado correctamente");
        }
      }
    });
  });
}

async function setupEmployeeRouteEvents(isAdmin) {
  const editForm = document.getElementById("editForm");
  if (editForm && eventListeners.editForm) {
    editForm.removeEventListener("click", eventListeners.editForm);
  }
  if (isAdmin) {
    editForm?.addEventListener("click", eventListeners.editForm = async () => {
      const name = document.getElementById("grid-first-name").value;
      const lastname = document.getElementById("grid-last-name").value;
      const email = document.getElementById("grid-identification").value;

      if (!name || !lastname || !email) {
        alert("Todos los campos son requeridos");
        return;
      }

      const editId = localStorage.getItem("editId");
      if (!editId) {
        alert("No se ha seleccionado un usuario para editar");
        return;
      }

      await updateUser(editId, { name, lastname, email, created: new Date().toISOString() });
      const updatedUsers = await getUsers();
      document.getElementById("create-form").reset();
      document.getElementById("btn-container").hidden = true;
      document.getElementById("container-form").hidden = true;
      document.getElementById("edit-text").hidden = true;
      document.getElementById("edit-text").textContent = "";
      localStorage.removeItem("editId");
      fillTable(updatedUsers, false, true);
    });

    const cancelForm = document.getElementById("cancelForm");
    if (cancelForm && eventListeners.cancelForm) {
      cancelForm.removeEventListener("click", eventListeners.cancelForm);
    }
    cancelForm?.addEventListener("click", eventListeners.cancelForm = () => {
      localStorage.removeItem("editId");
      document.getElementById("create-form").reset();
      document.getElementById("btn-container").hidden = true;
      document.getElementById("container-form").hidden = true;
      document.getElementById("edit-text").hidden = true;
      document.getElementById("edit-text").textContent = "";
    });
  } else {
    // Ocultar el formulario de edición para usuarios no administradores
    const containerForm = document.getElementById("container-form");
    if (containerForm) {
      containerForm.hidden = true;
    }
  }

  const search = document.getElementById("search");
  if (!search) {
    console.error("Elemento con id='search' no encontrado en el DOM");
    return;
  }
  if (search && eventListeners.search) {
    search.removeEventListener("input", eventListeners.search);
  }
  search.addEventListener("input", eventListeners.search = async (e) => {
    console.log("Evento input disparado con valor:", e.target.value);
    const users = await getUsers();
    console.log("Usuarios obtenidos para búsqueda:", users);
    const isAdmin = JSON.parse(localStorage.getItem("user")).role === "admin";
    if (!e.target.value) {
      fillTable(users, false, isAdmin);
    } else {
      const data = searchData(e.target.value, users);
      fillTable(data, true, isAdmin);
    }
  });
}

document.addEventListener("click", (e) => {
  if (e.target.tagName === "A" && e.target.href) {
    e.preventDefault();
    const path = new URL(e.target.href).pathname;
    console.log("Navegando a:", path);
    history.pushState({}, "", path);
    renderRoute();
  }
});

window.addEventListener("popstate", () => {
  console.log("Evento popstate, renderizando ruta para:", location.pathname);
  renderRoute();
});

document.addEventListener("DOMContentLoaded", () => {
  console.log("Carga inicial, renderizando ruta para:", location.pathname);
  renderRoute();
});