export function renderDashboard (){
    return `
    <div id="admin">
    <h1>Parqueadero Smart</h1>
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
        <h1>Parqueadero Smart</h1>
        <div id="historial-parqueadero"></div>
    </div>
    `
}