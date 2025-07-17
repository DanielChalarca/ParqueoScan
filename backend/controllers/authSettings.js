export function loginSettings() {
    const buttonLogin = document.getElementById("login-button");
    const inputPlaca = document.getElementById("placa");
    const inputPassword = document.getElementById("password");

    buttonLogin.addEventListener("click", async (event) => {
        event.preventDefault();

        const placa = inputPlaca.value.toUpperCase().replace(/\s/g, "");
        const password = inputPassword.value;


        const response = await fetch("http://localhost:3000/users");
        const users = await response.json();
        const user = users.find(u => u.placa=== placa && u.contraseña === password);

        if (user) {
            localStorage.setItem("loggedInUser", JSON.stringify(user.nombre));
            window.location.href = "/dashboard";
        } else {
            alert("Credenciales incorrectas. Usuario o contraseña no válidos.");
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
        const placa = inputPlaca.value.toUpperCase().replace(/\s/g, '');;
        const password = inputPassword.value;

        const newUser = {
            nombre: name,
            placa: placa,
            contraseña: password,
            admin: false
        };

        const checkResponse = await fetch(`http://localhost:3000/users?placa=${placa}`);
        const existingUsers = await checkResponse.json();
        if (existingUsers.length > 0) {
            alert("Esta placa ya está registrado.");
            return;
        }

        const response = await fetch("http://localhost:3000/users", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(newUser)
        });

        const registeredUser = await response.json();
        alert(`Registro exitoso para ${registeredUser.nombre}! Ahora puedes iniciar sesión.`);

        window.location.href = "/login";
    });

}

function authAdmin(){

}