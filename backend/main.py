import cv2
import easyocr
import requests
import serial
import time
from datetime import datetime
import re

# Inicializar OCR
reader = easyocr.Reader(['en'])

# Conectar a cámara
cam = cv2.VideoCapture(0)
if not cam.isOpened():
    print("No se puede abrir la cámara")
    exit()

print("Cámara lista.")
print("Presiona 'C' para capturar placa.")
print("Presiona 'Q' para cerrar la ventana.")

while True:
    ret, frame = cam.read()
    if not ret:
        print("Error al leer de la cámara.")
        break

    cv2.imshow("Lector de Placas", frame)
    key = cv2.waitKey(1) & 0xFF

    if key == ord('c'):
        print("Capturando imagen.")
        resultado = reader.readtext(frame)
        if resultado:
            for bbox, texto, conf in resultado:
                placa = re.sub(r'[^A-Za-z0-9]', '', texto).upper()
                if len(placa) >= 5:
                    hora_actual = datetime.now().isoformat()
                    print(f"Placa detectada: {placa}")

                    actualizar_registro = None
                    try:
                        registros_api = requests.get(API_URL).json()
                        for i in registros_api:
                            if "placa" in i and i["placa"] == placa:
                                if i.get("salida") is None:
                                    actualizar_registro = i
                                    break

                        if actualizar_registro:
                            actualizar_registro["salida"] = hora_actual
                            update_url = f"{API_URL}/{actualizar_registro['id']}"
                            response_put = requests.put(update_url, json=actualizar_registro)

                            print(f"Salida registrada exitosamente para la placa: {placa}")
                        else:
                            entrada = datetime.now().isoformat()
                            nuevo = {
                                "placa": placa,
                                "entrada": entrada,
                                "salida": None,
                                "valor": None
                            }
                            post = requests.post(API_URL, json=nuevo)
                            if post.status_code == 201:
                                print(f"Entrada registrada para {placa}")
                        
                        # Enviar señal al Arduino
                        if arduino:
                            arduino.write(b'1')
                            print("Comando enviado al Arduino para accionar la talanquera")
                        else:
                            print("Arduino no conectado, no se envió comando")

                    except Exception as e:
                        print(f"Error de conexión {e}")
                    break
                else:
                    print(f"Placa '{placa}' es demasiado corta o no válida.")
        else:
            print("No se detectó texto en la imagen.")

    elif key == ord('q'):
        print("Cerrando cámara")
        break

cam.release()
cv2.destroyAllWindows()