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

# URL de la API
API_URL = "http://localhost:3000/registros"

# Conexión al Arduino (ajusta el puerto según tu sistema)
try:
    arduino = serial.Serial('COM6', 9600)  # Reemplaza 'COM3' por tu puerto
    time.sleep(2)  # Esperar a que se estabilice la conexión
    print("Conexión establecida con Arduino")
except Exception as e:
    print(f"Error conectando con Arduino: {e}")
    arduino = None

print("Cámara lista. Presiona 'c' para capturar o 'q' para salir.")

while True:
    ret, frame = cam.read()
    if not ret:
        print("Error al leer de la cámara")
        break

    cv2.imshow("Lector de Placas", frame)
    key = cv2.waitKey(1) & 0xFF

    if key == ord('c'):
        resultado = reader.readtext(frame)
        if resultado:
            for bbox, texto, conf in resultado:
                placa = re.sub(r'[^A-Za-z0-9]', '', texto).upper()
                if len(placa) >= 5:
                    try:
                        res = requests.get(f"{API_URL}?placa={placa}")
                        registros = res.json()
                        registros = sorted(registros, key=lambda x: x['entrada'], reverse=True)

                        if registros and registros[0]['salida'] is None:
                            id_registro = registros[0]['id']
                            salida = datetime.now().isoformat()
                            patch = requests.patch(f"{API_URL}/{id_registro}", json={"salida": salida})
                            if patch.status_code == 200:
                                print(f"Salida registrada para {placa}")
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
                        print(f"Error de conexión o procesamiento: {e}")
                    break
        else:
            print("No se detectó texto en la imagen")

    elif key == ord('q'):
        print("Cerrando cámara")
        break

cam.release()
cv2.destroyAllWindows()