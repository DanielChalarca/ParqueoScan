export function dashboardSettings() {
    const API_URL = "http://localhost:3000"
    const lista = document.getElementById("lista-registros")
    
    let trabajadores = []
    
    async function cargarTrabajadores() {
        const res = await fetch(`${API_URL}/trabajadores`)
        trabajadores = await res.json()
    }
    
    async function cargarRegistros() {
        await cargarTrabajadores()
        
        const res = await fetch(`${API_URL}/registros`)
        const data = await res.json()
        
    lista.innerHTML = ""
    
    data.forEach((registro) => {
        const trabajador = trabajadores.find(t => t.placa.toUpperCase() === registro.placa.toUpperCase())
        const nombre = trabajador ? trabajador.nombre : null;
        
        const div = document.createElement("div")
        div.className = "registro"
        
        const entrada = new Date(registro.entrada)
        const salida = registro.salida ? new Date(registro.salida) : null
        
        let tiempoTexto = "—"
        let valorTexto = "—"
        
        if (salida) {
            const minutos = Math.floor((salida - entrada) / 60000)
            const horas = Math.ceil(minutos / 60)
            const valor = trabajador ? horas * 500 : horas * 3000
            
            tiempoTexto = `${minutos} minutos`
            valorTexto = `$${valor}`
        }
        
        div.innerHTML = `
        ${trabajador ? `<div class="etiqueta-trabajador">Trabajador: ${nombre}</div><br>` : ""}
        <strong>Placa</strong> ${registro.placa}<br>
        <strong>Entrada</strong> ${entrada.toLocaleString()}<br>
        <strong>Salida</strong> ${salida ? salida.toLocaleString() : "—"}<br>
        <strong>Tiempo</strong> ${tiempoTexto}<br>
        <strong>Valor</strong> ${valorTexto}<br>
        `
        
        if (!registro.salida) {
            const btn = document.createElement("button")
            btn.textContent = "Marcar salida"
            btn.addEventListener("click", () => marcarSalida(registro.id))
            div.appendChild(btn)
        }
        
        lista.appendChild(div)
    })
}

async function marcarSalida(id) {
    const salida = new Date().toISOString()
    
    const res = await fetch(`${API_URL}/registros/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ salida: salida }),
    })
    
    if (res.ok) {
        cargarRegistros()
    }
}

cargarRegistros()
window.marcarSalida = marcarSalida
}