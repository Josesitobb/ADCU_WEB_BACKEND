from anyio import Path
import cv2
import base64
from skimage.metrics import structural_similarity as ssim
import pytesseract
from openai import OpenAI
import json
import sys, os
from dotenv import load_dotenv

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from utils.ApiPython.ApiResponse import ApiResponse

# Variable para iniciar el pytesseract
pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"


# Verificar cuantos parametros viene desde Node.js
try:
    if(len(sys.argv)<12 or len(sys.argv)>13):
        print('falta argumentos por recibir')
        raise FileNotFoundError(f"No se recibieron los parametros suficientes para el analisis porfavor volver a intentar")
    
    # Variables que viene de Node.js
    
    # Datos del contrato
    contractNumber = sys.argv[1]
    typeofcontract = sys.argv[2]
    objectiveContract = sys.argv[3]
    startDate = sys.argv[4]
    endDate = sys.argv[5]
    periodValue = sys.argv[6]
    totalValue = sys.argv[7]
    
    # Datos del contratista
    firsName = sys.argv[8]
    lastName = sys.argv[9]
    idcard = sys.argv[10]
    
    # id del usuario y del documento
    idUserContract = sys.argv[11]
    idDocumentManagement = sys.argv[12]
    
    # Nombre completo del contratista
    nameComplete = firsName + " " + lastName
except Exception as e:
    print("Error al recibir los parametros:", str(e))
    
# IMAGENES
# Imagen costante
Imagen1 = r"C:\Users\JoseD\OneDrive\Documentos\ADCU\ADCU_WEB_BACKEND\utils\Img\certificateOfComplianceExample.jpg"
# Imagen del usuario a comparar
Imagen2 = fr"C:\Users\JoseD\OneDrive\Documentos\ADCU\ADCU_WEB_BACKEND\Files\{idUserContract}Img\certificateOfCompliance1.jpg"
    
    
# Funcion para decodificar la imagen en base64
def oneFilter(Imagen1, Imagen2):
    # Cargar imagenes en escala de grises
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
    
    
# Funcion para converir imagen a base 64
def encode_image_to_base64(image_path):
    with open(image_path, "rb") as image_file:
        encoded_string = base64.b64encode(image_file.read()).decode("utf-8")
    return encoded_string


def CompareChatgpt(Imagen1, Imagen2, contractNumber, typeofcontract, objectiveContract, startDate, endDate, periodValue, totalValue, nameComplete, idcard):

        # Cargar variables de entorno
        ImagenGuia = encode_image_to_base64(Imagen1)
        ImagenUsuario = encode_image_to_base64(Imagen2)
        # ApiKey=""
        
        # Cliente de chat GPT
        cliente = OpenAI(api_key="")
        response = cliente.chat.completions.create(
            model="gpt-5",
            messages = [
                {"role":"system",
                 "content":"Eres un asistente que ayuda a verificar la autenticidad de los documentos legales. Analiza cuidadosamente las imágenes y el texto extraído para determinar si el documento es genuino o ha sido alterado."
                 },
                {
                    "role":"user",
                    "content":f"""
                    Compara estas dos imaganes de de certificado de cumplimiento. La primera imagen es un esquema o un ejemplo y la segunda ya es la imagen del usuario.
                    
                    Validacion visuales
                    -Verifica si tiene la misma estructura, diseño, tipografia y ubicacion de los campos.
                    -Verifica si los logos y sellos son consistentes con los documentos oficiales.
                    -Verifica si hay signos de alteracion, como bordes irregulares, diferencias en la tipografia o el color.
                    
                    Validaciones de texto (usando OCR):
                    0.El numero de contrato debe coincidir con: {contractNumber}
                    1.El tipo de contrato debe coincidir con: {typeofcontract}
                    2.El nombre del contratista debe coincidir con: {nameComplete}
                    3.El numero de identificacion debe coincidir con: {idcard}
                    4.El obejtivo del contrato debe coincidir con: {objectiveContract}
                    5.La fecha de inicio debe coincidir con: {startDate}
                    6.La fecha de finalizacion debe coincidir con: {endDate}
                    7.El plazo de contrato debe coincidir con la duracion en meses: {startDate} a {endDate}
                    8.El valor del contrato debe coincidir con: {totalValue}
                    9.El valor del periodo debe coincidir con: {periodValue}
                    10.Tiene que estar firmado por el representante legal de la entidad contratante

                    """
                },
                {
                    "role":"user",
                    "content":[
                            {"type": "image_url", "image_url": {"url": f"data:image/png;base64,{ImagenGuia}"}},
                            {"type": "image_url", "image_url": {"url": f"data:image/png;base64,{ImagenUsuario}"}}
                    ]
                }
            ],
            tools=[
                {
                    "type":"function",
                    "function":{
                        "name":"AprobarDocumento",
                        "description": "Aprueba o rechaza un documento después de un análisis",
                        "parameters":{
                            "type":"object",
                            "properties":{
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
            ApiResponse(True, nameComplete, "OK","signedCertificateOfCompliance", idUserContract, idDocumentManagement)
        else:
            razon = arguments.get("razon", "Documento alterado o inválido")
            ApiResponse(False, nameComplete, razon, "signedCertificateOfCompliance", idUserContract, idDocumentManagement)

        
        
        
# -------------- MAIN ----------------------------------------#
resultado = oneFilter(Imagen1,Imagen2)
if resultado >= 0.90:
    CompareChatgpt(Imagen1, Imagen2, contractNumber, typeofcontract, objectiveContract, startDate, endDate, periodValue, totalValue, nameComplete, idcard)
else:
    ApiResponse(False,nameComplete,"Las imagenes son muy diferentes entre si","signedCertificateOfCompliance",idUserContract,idDocumentManagement)