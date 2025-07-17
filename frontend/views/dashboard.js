export function renderDashboard (){
    return `
    <h1>Parqueadero Smart</h1>
    <h2>Hola de nuevo, ${localStorage.loggedInUser.replace(/\"/g, "")}</h2>
    <div>
    <button type="button" id="logout-button">Salir</button>
    </div></br>
    <div id="admin">
        <div id="lista-registros"></div>
            <form>
                <label for="nombre-empleado">Nombre</label>
                <input type="text" name="nombre-empleado" id="nombre-empleado">
                <label for="placa-empleado">Placa</label>
                <input type="text" name="placa-empleado" id="placa-empleado">
                <button type="submit">Guardar</button>
            </form>
        <div id="lista-empleados"></div>
    </div>

    <div id="user">
        <div id="historial-parqueadero">hola</div>
    </div></br>
    `
}