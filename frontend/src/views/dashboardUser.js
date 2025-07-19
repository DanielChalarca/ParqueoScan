export function renderUserDashboard() {
    return `
    <main class="dashboard-container">
        <h1>Mi Historial de Parqueo</h1>
        <p>Bienvenido, <span id="user-name"></span>!</p>

        <section class="user-info">
            <h3>Tus Movimientos de Parqueo</h3>
            <div id="user-lista-registros" class="registros-container">
                Cargando tus registros...
            </div>
        </section>

        <button id="logout-button-user" class="logout-btn">Cerrar Sesión</button>
    </main>
    `;
}