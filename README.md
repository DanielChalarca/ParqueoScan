# Clyclope
## Descripción

Los procesos de regisros de ingresos y salidas de vehiculos suelen ser llevados a cabo por personal que toma la información del veiculo en cuestion para el control de ingresos y salidas.
Mediante la automatización de este procesos se pueden reducir los tiempos de esperas de los usuarios permitiendo así un agíl flujo de vehiculos, con Clyclope la implementación de un sistema
de reconocimiento de cáracteres mediante cámara, permite la recolección de los datos del vehiculo durannte el ingreso y salida, almacenando y procesando la información de los usuarios.

## Tecnologías utilizadas

| Tecnología        | Uso                                 |
| ----------------- | ----------------------------------- |
| HTML + CSS        | Interfaz de usuario                 |
| JavaScript        | SPA dinámica con DOM y Fetch/Axios  |
| JSON Server       | API falsa para guardar datos        |
| Python            | Backend para solicitar la imagen para procesar los cáracteres de la placa |

## Estructura del proyecto

```
├── backend
│ ├── main.py # Backend python para capturar los caracteres de la placa en la imagen 
│
├── frontend
│ ├── public
│ ├── src
│   ├── main.js  # Lógica SPA: agregar ítems, enviar al backend
│   ├── style.css
│ ├── .gitignore
│ ├── db.json
│ ├── index.html
│ ├── style.css
| ├── db.json  # Base de datos falsa para usuarios, trabjadores y registros
```

## ¿cómo ejecutar?

Paja ejecutar es necesario innstalar las depencdencias necesarias para la ejecución del backend

```bash
cd backend/
pip install easyocr
pip install easyocr imutils
```
