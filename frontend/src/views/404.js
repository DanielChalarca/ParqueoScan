export function show404() {
    return `
    <main class="not-found-container">
        <h1>404</h1>
        <h2>Página No Encontrada</h2>
        <p>Lo sentimos, la página que buscas no existe.</p>
        <a href="/login" class="back-home-link" data-link>Volver al inicio de sesión</a>
    </main>
    `;
}