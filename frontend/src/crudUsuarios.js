import axios from "axios";

let currentEditId = null;
const usuarioUrl = "http://localhost:3000/usuarios";

export async function obtenerUsuarios() {
    try {
        const resp = await axios.get(usuarioUrl);
        const data = resp.data;

        return data.sort(function (a, b) {
            return new Date(b.creado) - new Date(a.creado);
        });

    } catch (error) {
        console.log(error);
        return "Algo salió mal";
    }
}

export async function crearUsuario(datosFormulario) {
    try {
        await axios.post(usuarioUrl, datosFormulario);
        alert('Usuario creado exitosamente!')
        
        window.location.href = '/login'
    } catch (error) {
        console.log(error);
        return "ocurrió un error";
    }
}

function setEditId(id) {
    currentEditId = id;
}

function clearEditId() {
    currentEditId = null;
}

export async function eliminarUsuario(id) {
    const confirmed = confirm(
        "¿Estás seguro de que quieres eliminar este usuario?"
    );
    if (!confirmed) return;
    try {
        await axios.delete(`${usuarioUrl}/${id}`);
        alert("Usuario eliminado con éxito");
        location.reload(); 
    } catch (error) {
        console.log(error);
        alert("Error al eliminar Usuario");
    }
}

export async function editarUsuario(id) {
    try {
        const resp = await axios.get(`${usuarioUrl}/${id}`);
        const data = resp.data;

        document.getElementById("nombre").value = data.nombre;
        document.getElementById("telefono").value = data.telefono;
        document.getElementById("correo").value = data.correo;
        document.getElementById("placa").value = data.placa;
        document.getElementById("vehiculo").value = data.vehiculo;
        document.getElementById("creado").value = data.creado;

        setEditId(id);

    } catch (error) {
        console.error('Error al obtener usuario para editar:', error);
        alert("Error al obtener el usuario para editar.");
    }
}

export async function updateUser() {

    const nombreInput = document.getElementById('nombre');
    const telefonoInput = document.getElementById('telefono');
    const correoInput = document.getElementById('correo');
    const placaInput = document.getElementById('placa');
    const vehiculoInput = document.getElementById('vehiculo');
    const creadoInput = document.getElementById('creado');

    const nombre = nombreInput.value;
    const telefono = telefonoInput.value;
    const correo = correoInput.value;
    const placa = placaInput.value;
    const vehiculo = vehiculoInput.value;
    const creado = creadoInput.value;
   
    try {
        const datosActualizados = {
            nombre: nombre,
            telefono: telefono,
            correo: correo,
            placa: placa,
            vehiculo: vehiculo,
            creado: creado
        };

        await axios.put(`${usuarioUrl}/${currentEditId}`, datosActualizados);
        alert("Usuario actualizado con éxito.");

        nombreInput.value = '';
        telefonoInput.value = '';
        correoInput.value = '';
        placaInput.value = '';
        vehiculoInput.value = '';
        creadoInput.value = '';

        clearEditId();
        location.reload(); 

    } catch (error) {
        console.error('Error al actualizar usuario:', error);
        alert("Error al actualizar el usuario.");
    }
}