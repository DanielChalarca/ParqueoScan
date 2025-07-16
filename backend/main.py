import cv2
import easyocr
import requests
from datetime import datetime
import re

reader = easyocr.Reader(['en'])
cam = cv2.VideoCapture(0)
API_URL = "http://localhost:3000/registros"

if not cam.isOpened():
    print("no se puede abrir la cámara")
    exit()

print("cámara lista presiona c para capturar o q para salir")

while True:
    ret, frame = cam.read()
    if not ret:
        print("error al leer de la cámara")
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
                                print(f"salida registrada para {placa}")
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
                                print(f"entrada registrada para {placa}")
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
