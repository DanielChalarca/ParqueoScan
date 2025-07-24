// src/views/dashboardUser.js

export function renderUserDashboard() {
    return `
    <header class="main-header">
    <div class="header-left">
    <img src="/img/ciclop.png" alt="Logo Parqueadero Smart" class="header-logo">
    </div>
    <div class="header-right">
      <button id="logout-button">Cerrar Sesión</button>
      </div>
  </header>

    <main class="dashboard-container">
        <h1>Mi Historial de Parqueo</h1>
        <p>Bienvenido, <span id="user-name"></span>!</p>

        <section class="user-info">
            <h3>Tus Movimientos de Parqueo</h3>
            <div id="user-lista-registros" class="registros-container">
                Cargando tus registros...
                <div class="registro-parqueo">
                </div>
            </div>
        </section>

        <div class="dashboard-actions">
            <button class="pay-button" id="pay-button">Pagar</button> 
        </div>
    </main>
    `;
}