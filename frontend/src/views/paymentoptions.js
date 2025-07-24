export function renderPaymentOptions() {
    return `
    <header class="main-header">
        <div class="header-left">
            <img src="/img/ciclop.png" alt="Logo Parqueadero Smart" class="header-logo">
        </div>
        <div class="header-right">
            <button id="logout-button">Cerrar Sesión</button>
        </div>
    </header>

    <main class="payment-options-container">
        <h1>Opciones de Pago</h1>
        <p>Selecciona tu método de pago preferido.</p>

        <div class="payment-types-grid">
            <div class="payment-type-item">
                <img src="/img/efectivo.jpg" alt="Pago en Efectivo">
                <p>Efectivo</p>
            </div>
            <div class="payment-type-item">
                <img src="/img/pse-forma.jpg" alt="Pago PSE">
                <p>PSE</p>
            </div>
            <div class="payment-type-item">
                <img src="/img/credit-card.jpg" alt="Tarjeta de Crédito">
                <p>Tarjeta de Crédito</p>
            </div>
            <div class="payment-type-item">
                <img src="/img/ahorro-card.jpg" alt="Tarjeta de regalo">
                <p>Tarjeta de Regalo</p>
            </div>
            <div class="payment-type-item">
                <img src="/img/debito-card.jpg" alt="Tarjeta de Débito">
                <p>Tarjeta de Débito</p>
            </div>
            <div class="payment-type-item">
                <img src="/img/NEQUI.jpg" alt="NEQUI">
                <p>NEQUI</p>
            </div>
        </div>

        <div class="payment-actions">
            <button class="back-to-dashboard-button" id="main-back-button">Volver al Historial</button>
        </div>
    </main>
    `;
}