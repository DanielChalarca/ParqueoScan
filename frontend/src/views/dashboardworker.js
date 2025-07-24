export function renderAdminDashboardWorkers() {
    return `
    <header class="main-header">
    <div class="header-left">
    <img src="/img/ciclop.png" alt="Logo Parqueadero Smart" class="header-logo">
    </div>
    <nav class="header-center">
    <a class="nav-button" href="/dashboard-admin" data-link>Registro Vehiculos</a>
    </nav>
    <div class="header-right">
    <button id="logout-button">Cerrar Sesión</button>
    </div>
    </header>
    
    <div class="dashboard-container">
        <h1>Panel de Administración</h1>
        <p>Bienvenido, Administrador <span id="admin-name"></span>!</p>

        <section class="admin-trabajadores">
            <h3>Gestión de Registros de Parqueo</h3>
            <form id="registro-form">
                <label for="name">Nombre</label>
                <input type="text" name="name" id="name" required>
                <label for="placa">Placa</label>
                <input type="text" name="placa" id="placa" required>
                <label for="password">Contraseña</label>
                <input type="password" name="password" id="password" required>
                <button type="submit" id="register-button">Entrar</button>
            </form>
            <div id="lista-trabajadores" class="registros-container">
                <h4>Registros Actuales</h4>
                <p class="no-records-message">Cargando todos los registros...</p>
            </div>
        </section>
    </div>
        `;
}