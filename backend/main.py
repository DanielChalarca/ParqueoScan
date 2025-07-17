import cv2
import easyocr
import requests
from datetime import datetime
import re

reader = easyocr.Reader(['en'])
cam = cv2.VideoCapture(0)
API_URL = "http://localhost:3000/registros"

if not cam.isOpened():
    print("no se pudo abrir la cámara")
    exit()

print("cámara lista")
print("presiona c para capturar placa")
print("presiona q para cerrar la ventana")

while True:
    ret, frame = cam.read()
    if not ret:
        print("error al leer de la cámara")
        break

    cv2.imshow("Lector de Placas", frame)

    key = cv2.waitKey(1) & 0xFF

    if key == ord('c'):
        print("capturando imagen")
        resultado = reader.readtext(frame)
        if resultado:
            for bbox, texto, conf in resultado:
                placa = re.sub(r'[^A-Za-z0-9]', '', texto).upper()

                if len(placa) >= 5:
                    hora_actual = datetime.now().isoformat()
                    print(f"placa detectada: {placa}")

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
                            data_nueva_entrada = {
                                "placa": placa,
                                "entrada": hora_actual,
                                "salida": None,
                                "valor": None
                            }

                            response_post = requests.post(API_URL, json=data_nueva_entrada)
                            if response_post.status_code == 201:
                                print("Entrada registrada exitosamente.")
                            else:
                                print(f"Error al registrar entrada")

                    except Exception as e:
                        print(f"error de conexión {e}")
                    break
                else:
                    print(f"Placa '{placa}' es demasiado corta o no válida.")
        else:
            print("No se detectó texto en la imagen.")

    elif key == ord('q'):
        print("Cerrando cámara y programa.")
        break

cam.release()
cv2.destroyAllWindows()