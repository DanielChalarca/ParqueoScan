export function renderRegister() {
    return `
    <div class="register-container">
    <h1>Register</h1>
    <form>
    <label for="name">Nombre</label>
    <input type="text" name="name" id="name" required>
    <label for="placa">Placa</label>
    <input type="text" name="placa" id="placa" required>
    <label for="password">Contraseña</label>
    <input type="password" name="password" id="password" required>
    <button id="register-button">Entrar</button>
    </form>
    <div>
    <a href="/login" data-link>Inicia sesion</a>
    </div>
    </div>
    `
}