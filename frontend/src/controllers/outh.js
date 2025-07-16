import axios from "axios"; 

const USERS_API_URL = "http://localhost:3000/users"; 

export async function login({ email, password }) {
  try {
    // Usamos Axios para la solicitud GET con params
    const resp = await axios.get(USERS_API_URL, {
      params: { email, password },
    });
    const users = resp.data;

    if (users.length === 0) {
      alert("Usuario o contraseña inválido");
      return false;
    }

    const user = users[0];
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("isAuth", "true"); // Guardamos como string "true"
    return true;
  } catch (error) {
    console.error("Error durante el login:", error);
    alert("Ocurrió un error inesperado durante el inicio de sesión.");
    return false;
  }
}

export async function register({ name, username, email, role, password, placa }) { // Añadido 'username' y 'placa'
  try {
    // 1. Verifica si el email ya existe usando Axios GET
    const existingUsersResp = await axios.get(USERS_API_URL, {
      params: { email }, // Consulta por email
    });
    const existingUser = existingUsersResp.data[0]; // Axios devuelve un array, toma el primero si existe

    if (existingUser) {
      alert("El email ya está registrado."); // Mensaje amigable para el usuario
      console.error("Error de registro: El email ya existe.");
      return false;
    }

    const newUser = {
      name,
      username, // Asegúrate de que este campo exista en tu DB
      placa,    // Asegúrate de que este campo exista en tu DB
      email,
      role,
      password, // Nota: En producción, hashear la contraseña en el servidor
      created: new Date().toISOString(),
    };

    // 2. Registra un nuevo usuario usando Axios POST
    const response = await axios.post(USERS_API_URL, newUser);

    if (response.status !== 201) { // El estado de éxito de Axios para POST es típicamente 201 Created
        throw new Error(`Error al registrar usuario: Estado ${response.status}`);
    }

    const savedUser = response.data; // Axios devuelve el nuevo recurso directamente en data

    // Inicia sesión automáticamente al usuario después de un registro exitoso
    localStorage.setItem("user", JSON.stringify(savedUser));
    localStorage.setItem("isAuth", "true");

    return true;
  } catch (error) {
    console.error("Error durante el registro:", error);
    alert("Ocurrió un error inesperado durante el registro.");
    return false;
  }
}

export function logout() {
    localStorage.removeItem("user");
    localStorage.removeItem("isAuth");
}

