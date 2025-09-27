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
    # Verificar que vengan los 10 parametros
    if(len(sys.argv) !=10):
        raise FileExistsError(f"Nose re recibieron los parametro suficientes")
    # Datos del contrato
    firsName = sys.argv[1]
    lastName = sys.argv[2]
    idcard = sys.argv[3]
    email = sys.argv[4]
    telephone = sys.argv[5]
    EconomicaActivityNumber = sys.argv[6]
    residentialAddress = sys.argv[7]

    # Datos del usuario
    idUserContract = sys.argv[8]
    idDocumentManagement = sys.argv[9]
    
    # Nombre del contratista
    nameComplete = firsName +" " + lastName
except Exception as e:
    print("Error al recibir los parametros",str(e))


# Imagen constates
Imagen1Guia = fr"{IMAGENCONSTANTE}\Rut\rut1Example.jpg"

# Imagenes del usuario
Imagen1UserContract = fr"{IMAGENDELUSUARIO}\{idUserContract}Img\rut1.jpg"


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
        

def comparationChatgpt(firsName,lastName,idcard,email,telephone,EconomicaActivityNumber,idUserContract,idDocumentManagement,Imagen1Guia,Imagen1UserContract):
   
        #Img Encode
        Imagen1GuiaEncode = encode_image(Imagen1Guia)

        # Img User
        Imagen1UserContractEnconde = encode_image(Imagen1UserContract)
       

        # Cliente de Chat gpt
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
        
        1.Verificar que sea un rut de la DIAN
        2.Verificar numero  de identificacion tributaria {idcard} en las imagenes y el texto OCR.
        3.Verificar  el lugar de expedicion que exista en colombia y el departamento en las imagenes y el texto OCR.
        4.Verificar primer apellido y segundo apellido {lastName} en las imagenes y el texto OCR.
        5.Verificar primer nombre y segundo nombre {firsName} en las imagenes y el texto OCR.
        6.Verificar la ubicacion que exista en colombia en las imagenes y el texto OCR.
        7.Verificar la direccion {residentialAddress} en las imagenes y el texto OCR.
        8.Verificar el correo electronico {email} en las imagenes y el texto OCR.
        9.Verificar el numero de telefono {telephone} en las imagenes y el texto OCR.
        10.Verificar que el numero de actividad economica {EconomicaActivityNumber} acuerdate que puede tener varias pero verifica que tenga exactamente esta, en las imagenes y el texto OCR.
        11.Verifica que tenga qr y codigo de barras en las imagenes y el texto OCR.
        
        """
        

    },
    {
        "role": "user",
        "content": [
            {"type": "image_url", "image_url": {"url": f"data:image/png;base64,{Imagen1GuiaEncode}"}},
            {"type": "image_url", "image_url": {"url": f"data:image/png;base64,{Imagen1UserContractEnconde}"}},


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
            ApiResponse(True, nameComplete, "OK","rut", idUserContract, idDocumentManagement)
        else:
            razon = arguments.get("razon", "Documento alterado o inválido")
            ApiResponse(False, nameComplete, razon, "rut", idUserContract, idDocumentManagement)





# -------------- MAIN ----------------------------------------#
Resultado1 = OneFilter(Imagen1Guia,Imagen1UserContract) 


if Resultado1 <0.90:
    ApiResponse(False,nameComplete,"Las imagenes son muy diferentes entre si","rut",idUserContract,idDocumentManagement)
    raise FloatingPointError(f"Resultado {Resultado1} No coincide con el esquena")

comparationChatgpt(firsName,lastName,idcard,email,telephone,EconomicaActivityNumber,idUserContract,idDocumentManagement,Imagen1Guia,Imagen1UserContract)


