import cv2
import base64
from skimage.metrics import structural_similarity as ssim
import pytesseract
from openai import OpenAI
import json
import sys
import requests
import os
from dotenv import load_dotenv

# Acceder a la variables .env
load_dotenv()

# Variable para iniciar esa mierda
pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"
# # Parametro que va recibir desde Node.JS
if len(sys.argv) <12:
    print('falta argumentos por recibir')
    raise FileNotFoundError(f"No se recibieron los parametros suficientes para el analisis porfavor volver a intentar")
    
try: 
    nameContract = sys.argv[1]
    lastContract = sys.argv[2]
    starteDate = sys.argv[3]
    endDate = sys.argv[4]
    typeContract = sys.argv[5]
    price = sys.argv[6]
    idcard = sys.argv[7]
    email = sys.argv[8]
    telephone = sys.argv[9]
    addresContractor = sys.argv[10]
    IdUser = sys.argv[11]
    IdUserContract = sys.argv[12]
    IdDocumentManagement = sys.argv[13]
except Exception as error:
    print(error)
# Imagen costante
Imagen1 = r"C:\Users\JoseD\OneDrive\Documentos\ADCU\ADCU_WEB_BACKEND\utils\Img\filing_letter.jpg"
Imagen2 = fr"C:\Users\JoseD\OneDrive\Documentos\ADCU\ADCU_WEB_BACKEND\Files\{IdUser}Img\filing_letter.jpg"

def primerFiltro(Imagen1, Imagen2):
    img1 = cv2.imread(Imagen1, cv2.IMREAD_GRAYSCALE)
    img2 = cv2.imread(Imagen2, cv2.IMREAD_GRAYSCALE)
    # Validar lectura
    if img1 is None:
        raise FileNotFoundError(f"No se pudo cargar la imagen: {Imagen1}")
    if img2 is None:
        raise FileNotFoundError(f"No se pudo cargar la imagen: {Imagen2}")
    # Calcular SSIM
    score, diff = ssim(img1, img2, full=True)
    return score

def ComparararChatgpt(Imagen1, Imagen2, price, telephone, starteDate, endDate, nameContract, idcard):
    import os, base64, json
    from openai import OpenAI

    KEY = os.getenv("KEY_CHATGPT")

    def encode_image(image_path):
        with open(image_path, "rb") as image_file:
            return base64.b64encode(image_file.read()).decode("utf-8")

    # Encode de las imágenes
    ImagenGuia = encode_image(Imagen1)
    ImagenUsuario = encode_image(Imagen2)

    client = OpenAI(api_key=KEY)
    response = client.chat.completions.create(
        model="gpt-5",
        messages = [
    {
        "role": "system",
        "content": "Eres un experto en validación de documentos visuales y contractuales."
    },
    {
        "role": "user",
        "content": f"""
        Compara estas dos imágenes de contrato. La primera imagen es un esquema o un ejemplo y la segunda ya es la imagen del usuario

        🔎 Validaciones visuales:
        - Verifica si tienen la misma estructura, diseño, tipografía y ubicación de los campos.
        - Solo deben variar los siguientes campos:
            1. El número de pago que sea un numero
            2. El número de contrato de prestación de servicios
            3. El tipo de contrato → {typeContract}
            4. El nombre del contratista → {nameContract}
            5. El número de cédula → {idcard}
            6. Teléfono → {telephone}
            7. Correo electrónico → {email}
            8. Dirección → {addresContractor}
            9. Fecha de inicio → {starteDate}
            10. Fecha de finalización → {endDate}
            11. La suma, el concepto, la cuenta bancaria y los datos de pago
            12. Firma

        📅 Validaciones de fecha:
        - La fecha de inicio es {starteDate} y la de finalización es {endDate} (formato ISO) del CONTRATO EN EL DOCUMENTO GUIA DICE " durante el 
periodo comprendido del 03 al 31 de enero de 2025".
        - Verifica que correspondan al PERIODO escrito en el contrato (ejemplo en el documento: "del 26 de junio de 2025 al 30 de agosto de 2025").
        - Rechaza si las fechas no coinciden con el rango que aparece en el documento.

        💰 Validaciones de valor:
        - El precio real del contrato es {price} (viene sin puntos , ejemplo 120000).
        - En el documento debe aparecer correctamente escrito con separadores de miles o por comas tambien (ejemplo: "120.000" o "120,000").
        - Verifica también que la SUMA EN LETRAS coincida con ese valor numérico.
        - Rechaza si hay diferencia entre la cifra numérica y la cantidad escrita en letras.

        👤 Validaciones de identidad:
        - El contratista debe ser {nameContract} {lastContract} identificado con cédula {idcard}.
        - El teléfono debe ser {telephone}, el correo {email} y la dirección {addresContractor}.

        🚫 Rechazo:
        - Si detectas que la estructura del documento fue alterada.
        - Si existen cambios en campos que no están permitidos en la lista anterior.
        - Si las fechas, el tipo de contrato, la identidad del contratista o los montos no coinciden exactamente con lo esperado.

        Responde únicamente con 'aprobado' o 'rechazado' y una breve explicación del motivo.
        """
    },
    {
        "role": "user",
        "content": [
            {"type": "image_url", "image_url": {"url": f"data:image/png;base64,{ImagenGuia}"}},
            {"type": "image_url", "image_url": {"url": f"data:image/png;base64,{ImagenUsuario}"}}
        ]
    }
],
        tools=[
            {
                "type": "function",
                "function": {
                    "name": "AprobarDocumento",
                    "description": "Aprueba o rechaza un documento después de un análisis",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "id": {"type": "string", "description": "ID del documento analizado"},
                            "estado": {
                                "type": "string",
                                "enum": ["aprobado", "rechazado"],
                                "description": "Resultado de la validación del documento"
                            },
                            "razon": {
                                "type": "string",
                                "description": "Si es rechazado, explica el motivo"
                            }
                        },
                        "required": ["id", "estado"]
                    }
                }
            }
        ],
        tool_choice={"type": "function", "function": {"name": "AprobarDocumento"}}
    )

    msg = response.choices[0].message
    tool_call = msg.tool_calls[0]
    arguments = json.loads(tool_call.function.arguments)
    estado = arguments.get("estado")

    if estado == "aprobado":
        UrlApi("aprobado", nameContract, "OK", IdUserContract, IdDocumentManagement)
    else:
        razon = arguments.get("razon", "Documento alterado o inválido")
        UrlApi("rechazado", nameContract, razon, IdUserContract, IdDocumentManagement)

     
def UrlApi(State,Usercomparasion,Description,IdUserComparasion,IdDocumentManagement):
    url = "http://localhost:3000/api/Data/Saved"
    data = {
     "Field":str('certificate_of_compliance'),
     "Status":str(State),
     "Usercomparasion":str(Usercomparasion),
     "Description":Description,
     "IdUserComparasion":str(IdUserComparasion),
     "IdDocumentManagement":str(IdDocumentManagement)   
    }
    try:
        response = requests.post(url,json=data,headers={"Content-Type": "application/json; charset=utf-8"})
        # print("Data enviada:", data)
        # print("Respuesta:", response.status_code, response.text)
        return response.json()
    except requests.exceptions.RequestException as error:
        return {"success": False, "message": str(error)}
    
    
# -------------- MAIN ----------------------------------------#
resultado = primerFiltro(Imagen1,Imagen2)
if resultado >= 0.90:
    ComparararChatgpt(
    Imagen1,
    Imagen2,
    price,
    telephone,
    starteDate,
    endDate,
    nameContract,
    idcard
)

else:
    UrlApi("rechazado",nameContract,'El documento no cumple con el esquema',IdUserContract,IdDocumentManagement)