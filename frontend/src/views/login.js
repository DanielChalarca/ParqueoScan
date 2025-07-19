export function renderLogin() {
    return `
    <main class="login-container">
        <h1>Login</h1>
        <form>
            <label for="placa">Placa</label>
            <input type="placa" name="placa" id="placa" required>
            <label for="password">Contraseña</label>
            <input type="password" name="password" id="password" required>
            <button id="login-button">Entrar</button>
        </form>
        <div>
            <a href="/register" data-link>Registrate</a>
        </div>
    </main>
    `
}