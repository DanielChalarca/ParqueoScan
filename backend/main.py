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
                    hora_entrada = datetime.now().isoformat()
                    print(f"placa detectada: {placa} enviando a base de datos")

                    data = {
                        "placa": placa,
                        "entrada": hora_entrada,
                        "salida": None,
                        "valor": None
                    }

                    try:
                        r = requests.post(API_URL, json=data)
                        if r.status_code == 201:
                            print("registro guardado exitosamente")
                        else:
                            print(f"error al guardar código {r.status_code}")
                    except Exception as e:
                        print(f"error de conexión {e}")

                    break
        else:
            print("no se detectó texto")

    elif key == ord('q'):
        print("cerrando cámara")
        break

cam.release()
cv2.destroyAllWindows()
