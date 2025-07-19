export function renderAdminDashboard() {
    return `
    <main class="dashboard-container">
        <h1>Panel de Administración</h1>
        <p>Bienvenido, Administrador <span id="admin-name"></span>!</p>

        <section class="admin-controls">
            <h3>Gestión de Registros de Parqueo</h3>
            <div id="lista-registros" class="registros-container">
                Cargando todos los registros...
            </div>
        </section>

        <button id="logout-button" class="logout-btn">Cerrar Sesión</button>
    </main>
    `;
}