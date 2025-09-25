from anyio import Path
import cv2
import base64
from skimage.metrics import structural_similarity as ssim
import pytesseract
from openai import OpenAI
import json
import sys, os
# from dotenv import load_dotenv


sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from utils.ApiPython.ApiResponse import ApiResponse


# Acceder a la variables .env
# load_dotenv()

# Variable para iniciar el pytesseract
pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"



# Parametro que viene de Node.js

try:
    # Verificar que vengan los 12 parametros
    if(len(sys.argv) !=8):
        raise FileExistsError(f"Nose re recibieron los parametro suficientes")
    # Datos del contrato
    firsName = sys.argv[1]
    lastName = sys.argv[2]
    idcard = sys.argv[3]
    email = sys.argv[4]
    telephone = sys.argv[5]


    # Datos del usuario
    idUserContract = sys.argv[6]
    idDocumentManagement = sys.argv[7]
    
    # Nombre del contratista
    nameComplete = firsName +" " + lastName
except Exception as e:
    print("Error al recibir los parametros",str(e))



# Imagenes del usuario
Imagen1UserContract = fr"C:\Users\JoseD\OneDrive\Documentos\ADCU\ADCU_WEB_BACKEND\Files\{idUserContract}Img\AccountCertification1.jpg"



# Funcion para obtener el % de comparacion
def OneFilter (ImgGuia ,ImgContract):
    # Cargar la imaganes en escalas de grises
    ImgGrayScaleGuia  = cv2.imread(ImgGuia, cv2.IMREAD_GRAYSCALE)
    ImgGrayScaleContract = cv2.imread(ImgContract, cv2.IMREAD_GRAYSCALE)

    if  ImgGrayScaleContract is None :
        raise FileNotFoundError(f"Error al cargar la primera imagen, no existe en el directorio")
    
    if ImgGrayScaleGuia  is None:
        raise FileNotFoundError(f"Error al cargar la primera imagen, no existe en el directorio")
    
    score = ssim(ImgGrayScaleGuia,ImgGrayScaleContract)
    return score



# Función para convertir imagen a base64
def encode_image(image_path):
        with open(image_path, "rb") as image_file:
            return base64.b64encode(image_file.read()).decode("utf-8")
        

def comparationChatgpt(firsName,lastName,idcard,email,telephone,idUserContract,idDocumentManagement,Imagen1UserContract):
        # Img User
        Imagen1UserContractEnconde = encode_image(Imagen1UserContract)

        # Cliete de Chat gpt
        cliente = OpenAI(api_key="")
        

        # Menssaje
        response = cliente.chat.completions.create(
            model="gpt-5",
            messages=[
    {
        "role": "system",
        "content": (
            "Eres un asistente experto en la verificación de documentos legales. "
            "Tu tarea es analizar imágenes de contratos y el texto extraído por OCR "
            "para determinar si el documento es auténtico o ha sido alterado. "
            "Debes verificar estructura, diseño, logos, sellos, coherencia de datos, "
            "y consistencia entre texto y formato oficial se te va a pasar una imaganes de guia para que veas como son los logos etc..."
        )
    },
    {
                "role": "user",
                "content": f"""
        Se te proporcionan imágenes y texto OCR de un certificacion calidad tributaria contratista. 
        Debes realizar las siguientes validaciones:
        
        Primera imagen
        1.Verifca que el documento sea un cuenta bancaria oficial
        2.Verifica que el nombre del contratista {nameComplete} coincida con el nombre en la imagen
        3.Verifica que el numero de identificacion tributaria {idcard} coincida con el numero en la imagen
        Posiblemente se te puede pedir que verifiques si salen:
        4.Verifica que el email {email} coincida con el email en la imagen
        5.Verifica que el telefono {telephone} coincida con el telefono en la imagen
        
        """
        

    },
    {
        "role": "user",
        "content": [
            {"type": "image_url", "image_url": {"url": f"data:image/png;base64,{Imagen1UserContractEnconde}"}}
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
            ApiResponse(True, nameComplete, "OK","accountCertification", idUserContract, idDocumentManagement)
        else:
            razon = arguments.get("razon", "Documento alterado o inválido")
            ApiResponse(False, nameComplete, razon, "accountCertification", idUserContract, idDocumentManagement)





# -------------- MAIN ----------------------------------------#






comparationChatgpt(firsName,lastName,idcard,email,telephone,idUserContract,idDocumentManagement,Imagen1UserContract)