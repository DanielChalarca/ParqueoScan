export function renderAdminDashboard() {
    return `

    <header class="main-header">
        <div class="header-left">
            <img src="/img/ciclop.png" alt="Logo Parqueadero Smart" class="header-logo">
        </div>
        <nav class="header-center">
            <a class="nav-button" href="/Admindashboardworker" data-link>Trabajadores</a>
        </nav>
        <div class="header-right">
            <button id="logout-button">Cerrar Sesión</button>
        </div>
    </header>


    <main class="dashboard-container">
        <h1>Panel de Administración</h1>
        <p>Bienvenido, Administrador <span id="admin-name"></span>!</p>

        <section class="admin-controls">
            <h3>Gestión de Registros de Parqueo</h3>
            <div id="lista-registros" class="registros-container">
                Cargando todos los registros...
            </div>
        </section>

    </main>
    `;
}