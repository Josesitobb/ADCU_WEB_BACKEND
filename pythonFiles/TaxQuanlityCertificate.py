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
    # Verificar que vengan los 11 parametros
    if(len(sys.argv) !=11):
        raise FileExistsError(f"Nose re recibieron los parametro suficientes")
    # Datos del contrato
    contractNumber = sys.argv[1]
    firsName = sys.argv[2]
    lastName = sys.argv[3]
    idcard = sys.argv[4]
    email = sys.argv[5]
    telephone = sys.argv[6]
    institutionalEmail = sys.argv[7]
    residentialAddress = sys.argv[8]

    # Datos del usuario
    idUserContract = sys.argv[9]
    idDocumentManagement = sys.argv[10]
    
    # Nombre del contratista
    nameComplete = firsName +" " + lastName
except Exception as e:
    print("Error al recibir los parametros",str(e))


# Imagen constates
Imagen1Guia =fr"{IMAGENCONSTANTE}\TaxQualityCertificate\taxQualityCertificate1Example.jpg"
Imagen2Guia =fr"{IMAGENCONSTANTE}\TaxQualityCertificate\taxQualityCertificate2Example.jpg"

# Imagenes del usuario
Imagen1UserContract = fr"{IMAGENDELUSUARIO}\{idUserContract}Img\taxQualityCertificate1.jpg"
Imagen2UserContract = fr"{IMAGENDELUSUARIO}\{idUserContract}Img\taxQualityCertificate2.jpg"


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
        

def comparationChatgpt(contractNumber,firsName,lastName,idcard,email,telephone,institutionalEmail,idUserContract,idDocumentManagement,Imagen1Guia,Imagen2Guia,Imagen1UserContract,Imagen2UserContract):
   
        #Img Encode
        Imagen1GuiaEncode = encode_image(Imagen1Guia)
        Imagen2GuiaEncode = encode_image(Imagen2Guia)
        # Img User
        Imagen1UserContractEnconde = encode_image(Imagen1UserContract)
        Imagen2UserContractEnconde = encode_image(Imagen2UserContract)

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
        
        1.Verificar el numero de contrato {contractNumber} en las imagenes y el texto OCR.
        2.Verificar que el nombre del contratista {nameComplete} coincida en las imagenes y el texto OCR.
        3.Verificar que el numero de identificacion {idcard} coincida en las imagenes y el texto OCR.
        4.Verificar que la primera tabla tenga un encabezado de INFORMACION PERSONAL, tambien que en la parte si y no este con una X
        5.Verificar que la segunda tabla tenga un encabezado de DEPURACION CALCULO DE RENTE, tambien que en la parte si y no este con una X
        
        Segunda imagen
        
        6.Verificar que la tercera tabla tenga un encabezado de DEPURACION CALCULO DE RENTA, tambien que en la parte si y no este con una X
        7.Verificar que tenga la firma del contratista
        8.Verificar que este el nombre del contratista {nameComplete} al lado de la firma
        9.Verificar que tenga el numero de identificacion {idcard} al lado de la firma
        10.Verificar que tenga la dirrecion de correspondecia {residentialAddress}
        11.Verificar que tenga el telefono de contact {telephone}
        12.Verificar que tenga el email {email}
        13.Verificar que tenga el email institucional {institutionalEmail}
        """
        

    },
    {
        "role": "user",
        "content": [
            {"type": "image_url", "image_url": {"url": f"data:image/png;base64,{Imagen1GuiaEncode}"}},
            {"type": "image_url", "image_url": {"url": f"data:image/png;base64,{Imagen1UserContractEnconde}"}},

            {"type": "image_url", "image_url": {"url": f"data:image/png;base64,{Imagen2GuiaEncode}"}},
            {"type": "image_url", "image_url": {"url": f"data:image/png;base64,{Imagen2UserContractEnconde}"}},

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
            ApiResponse(True, nameComplete, "OK","taxQualityCertificate", idUserContract, idDocumentManagement)
        else:
            razon = arguments.get("razon", "Documento alterado o inválido")
            ApiResponse(False, nameComplete, razon, "taxQualityCertificate", idUserContract, idDocumentManagement)





# -------------- MAIN ----------------------------------------#
Resultado1 = OneFilter(Imagen1Guia,Imagen1UserContract) 
Resultado2 = OneFilter(Imagen2Guia,Imagen2UserContract)


ResultadoAll = [Resultado1,Resultado2]


for i in ResultadoAll:
     if i <0.90:
        ApiResponse(False,nameComplete,"Las imagenes son muy diferentes entre si","taxQualityCertificate",idUserContract,idDocumentManagement)
        raise FloatingPointError(f"Resultado {i} No coincide con el esquena")

comparationChatgpt(contractNumber,firsName,lastName,idcard,email,telephone,institutionalEmail,idUserContract,idDocumentManagement,Imagen1Guia,Imagen2Guia,Imagen1UserContract,Imagen2UserContract)