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


# Acceder a la variables .env
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), "..", ".env"))
IMAGENCONSTANTE = os.getenv("IMAGENCONSTANTE")
IMAGENDELUSUARIO = os.getenv("IMAGENDELUSUARIO")
KEYCHATGPT = os.getenv("KEYCHATGPT")

# Variable para iniciar el pytesseract
pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"



# Parametro que viene de Node.js

try:
    # Verificar que vengan los 12 parametros
    if(len(sys.argv) !=12):
        raise FileExistsError(f"Nose re recibieron los parametro suficientes")
    # Datos del contrato
    firsName = sys.argv[1]
    lastName = sys.argv[2]
    idcard = sys.argv[3]
    typeofcontract = sys.argv[4]
    contractNumber = sys.argv[5]
    startDate = sys.argv[6]
    endDate = sys.argv[7]
    totalValue = sys.argv[8]
    objectiveContract = sys.argv[9]

    # Datos del usuario
    idUserContract = sys.argv[10]
    idDocumentManagement = sys.argv[11]
    
    # Nombre del contratista
    nameComplete = firsName +" " + lastName
except Exception as e:
    print("Error al recibir los parametros",str(e))


# Imagen constates
Imagen1Guia = fr"{IMAGENCONSTANTE}\InitiationRecord\initiationRecord1Example.jpg"

# Imagenes del usuario
Imagen1UserContract = fr"{IMAGENDELUSUARIO}\{idUserContract}Img\initiationRecord1.jpg"



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
        

def comparationChatgpt(firsName,lastName,idcard,typeofcontract,contractNumber,startDate,endDate,totalValue,objectiveContract,idUserContract,idDocumentManagement,Imagen1Guia,Imagen1UserContract):
   
        #Img Encode
        Imagen1GuiaEncode = encode_image(Imagen1Guia)
        # Img User
        Imagen1UserContractEnconde = encode_image(Imagen1UserContract)

        # Cliete de Chat gpt
        cliente = OpenAI(api_key=KEYCHATGPT)
        

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
        1.Verifica si es un ACTA DE INICIO DE CONTRATO
        2.Verifica que el nombre del contratista sea: {nameComplete}
        3.Verifica el objetivo del contrato: {objectiveContract}
        4.Verifica el monto del contrato: {totalValue}
        5.Verifica el plazo del contrato: {startDate} a {endDate}
        6.Verifica el nombre del contratista {nameComplete} y numero de identificacion {idcard} y el numero de contrato {contractNumber}
        7.Verifica el numero de contrato {contractNumber} y el dia que se reunion seria el dia de inicio del contrato {startDate}
        8.Verifica que este firmando por el contratista y el representante legal de la entidad estatal

        """
        

    },
    {
        "role": "user",
        "content": [
            {"type": "image_url", "image_url": {"url": f"data:image/png;base64,{Imagen1GuiaEncode}"}},
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
            ApiResponse(True, nameComplete, "OK","initiationRecord", idUserContract, idDocumentManagement)
        else:
            razon = arguments.get("razon", "Documento alterado o inválido")
            ApiResponse(False, nameComplete, razon, "initiationRecord", idUserContract, idDocumentManagement)





# -------------- MAIN ----------------------------------------#
Resultado1 = OneFilter(Imagen1Guia,Imagen1UserContract) 
if Resultado1 <0.90:
    ApiResponse(False,nameComplete,"Las imagenes son muy diferentes entre si","initiationRecord",idUserContract,idDocumentManagement)
    raise FloatingPointError(f"Resultado {Resultado1} No coincide con el esquena")



comparationChatgpt(firsName,lastName,idcard,typeofcontract,contractNumber,startDate,endDate,totalValue,objectiveContract,idUserContract,idDocumentManagement,Imagen1Guia,Imagen1UserContract)