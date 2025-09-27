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
load_dotenv()
IMAGENCONSTANTE = os.getenv("IMAGENCONSTANTE")
IMAGENDELUSUARIO = os.getenv("IMAGENDELUSUARIO")
KEYCHATGPT = os.getenv("KEYCHATGPT")


# Variable para iniciar el pytesseract
pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"



# Parametro que viene de Node.js

try:
    # Verificar que vengan los 16 parametros
    if(len(sys.argv) !=16):
        raise FileExistsError(f"Nose re recibieron los parametro suficientes")
    # Datos del contrato
    typeofcontract = sys.argv[1]
    contractNumber = sys.argv[2]
    startDate = sys.argv[3]
    endDate = sys.argv[4]
    totalValue = sys.argv[5]
    periodValue = sys.argv[6]
    extension = sys.argv[7]
    addiction = sys.argv[8]
    suspension = sys.argv[9]
    objectiveContract = sys.argv[10]

    # Datos del usuario
    firsName = sys.argv[11]
    lastName = sys.argv[12]
    idcard = sys.argv[13]
    idUserContract = sys.argv[14]
    idDocumentManagement = sys.argv[15]

    nameComplete = firsName +" " + lastName
except Exception as e:
    print("Error al recibir los parametros",str(e))


# Imagen constates
Imagen1Guia =fr"{IMAGENCONSTANTE}\ActivityReport\activityReport1Example.jpg"
Imagen2Guia =fr"{IMAGENCONSTANTE}\ActivityReport\activityReport2Example.jpg"
Imagen3Guia =fr"{IMAGENCONSTANTE}\ActivityReport\activityReport3Example.jpg"
Imagen4Guia =fr"{IMAGENCONSTANTE}\ActivityReport\activityReport4Example.jpg"
Imagen5Guia =fr"{IMAGENCONSTANTE}\ActivityReport\activityReport5Example.jpg"


# Imagenes del usuario
Imagen1UserContract = fr"{IMAGENDELUSUARIO}\{idUserContract}Img\activityReport1.jpg"
Imagen2UserContract = fr"{IMAGENDELUSUARIO}\{idUserContract}Img\activityReport2.jpg"
Imagen3UserContract = fr"{IMAGENDELUSUARIO}\{idUserContract}Img\activityReport3.jpg"
Imagen4UserContract = fr"{IMAGENDELUSUARIO}\{idUserContract}Img\activityReport4.jpg"
Imagen5UserContract = fr"{IMAGENDELUSUARIO}\{idUserContract}Img\activityReport5.jpg"


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
        

def comparationChatgpt(typeofcontract,contractNumber,startDate,endDate,totalValue,periodValue,extension,addiction,suspension,objectiveContract,nameComplet,idcard,idUserContract,idDocumentManagement,Imagen1Guia,Imagen2Guia,Imagen3Guia,Imagen4Guia,Imagen5Guia,Imagen1UserContract,Imagen2UserContract,Imagen3UserContract,Imagen4UserContract,Imagen5UserContract):
   
        #Img Encode
        Imagen1GuiaEncode = encode_image(Imagen1Guia)
        Imagen2GuiaEncode = encode_image(Imagen2Guia)
        Imagen3GuiaEncode = encode_image(Imagen3Guia)
        Imagen4GuiaEncode = encode_image(Imagen4Guia)
        Imagen5GuiaEncode = encode_image(Imagen5Guia)
        # Img User
        Imagen1UserContractEnconde = encode_image(Imagen1UserContract)
        Imagen2UserContractEnconde = encode_image(Imagen2UserContract)
        Imagen3UserContractEnconde = encode_image(Imagen3UserContract)
        Imagen4UserContractEnconde = encode_image(Imagen4UserContract)
        Imagen5UserContractEnconde = encode_image(Imagen5UserContract)

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
            "y consistencia entre texto y formato oficial."
        )
    },
    {
                "role": "user",
                "content": f"""
        Se te proporcionan imágenes y texto OCR de un contrato. 
        Debes realizar las siguientes validaciones:

        ### 1. Validaciones visuales (todas las imágenes)
        - Verifica si la estructura, diseño, tipografía y ubicación de los campos coinciden con documentos oficiales.
        - Verifica que los logos y sellos sean consistentes con documentos oficiales.
        - Revisa signos de alteración (bordes irregulares, tipografía diferente, cambios de color).

        ---

        ### 2. Validaciones de la primera imagen (datos generales del contrato)
        1. Tipo de contrato: **{typeofcontract}**
        2. Número y fecha de contrato: **{contractNumber}** | **{startDate}**
        3. Nombre del contratista: **{nameComplet}**
        4. Número de documento: **{idcard}**
        5. Plan de ejecución: desde **{startDate}** hasta **{endDate}**
        6. Valor total del contrato (números y letras): **{totalValue}**
        7. Valor del período de cobro (números y letras): **{periodValue}**
        8. Número del proyecto / Imputación presupuestal: debe estar bien escrito.
        9. Fecha de acta de inicio: **{startDate}**
        10. Prórroga: si **true** debe haber justificación; si **false** debe decir "N/A". Valor actual: **{extension}**
        11. Adición: si **true** debe haber justificación; si **false** debe decir "N/A". Valor actual: **{addiction}**
        12. Suspensión: si **true** debe haber justificación; si **false** debe decir "N/A". Valor actual: **{suspension}**
        13. Fecha prevista de terminación (incluyendo prórrogas y suspensiones): **{endDate}**
        14. Objetivo del contrato debe coincidir con: **{objectiveContract}**

        ---

        ### 3. Validaciones de la segunda, tercera y cuarta imagen (actividades y obligaciones)
        1. Deben existir **4 columnas** con títulos exactos:
        - OBLIGACIONES ESPECIALES  
        - ACTIVIDAD  
        - PRODUCTOS  
        - MEDIO DE VERIFICACIÓN Y SU UBICACIÓN FÍSICA Y/O VIRTUAL
        2. Cada celda debe estar completamente llena (sin vacíos).
        3. En la **página 4** debe haber un encabezado de **Información personal** con estas columnas:
        - Nombre de la empresa donde se aportó pago de salud  
        - Nombre de la empresa donde se aporta pago a ARL  
        - Nombre de la empresa donde se aporta pensión  
        Todas deben estar llenas (ninguna vacía).

        ---

        ### 4. Validaciones de la quinta imagen (firmas)
        1. Debe existir un encabezado **Firmas**.
        2. Deben existir **2 columnas**:
        - Declaración del contratista → firmado por: **{nameComplet}**, cédula: **{idcard}**.
        - Declaración del supervisor y/o interventor → debe estar presente y bien escrito.
        """
    },
    {
        "role": "user",
        "content": [
            {"type": "image_url", "image_url": {"url": f"data:image/png;base64,{Imagen1GuiaEncode}"}},
            {"type": "image_url", "image_url": {"url": f"data:image/png;base64,{Imagen1UserContractEnconde}"}},

            {"type": "image_url", "image_url": {"url": f"data:image/png;base64,{Imagen2GuiaEncode}"}},
            {"type": "image_url", "image_url": {"url": f"data:image/png;base64,{Imagen2UserContractEnconde}"}},

            {"type": "image_url", "image_url": {"url": f"data:image/png;base64,{Imagen3GuiaEncode}"}},
            {"type": "image_url", "image_url": {"url": f"data:image/png;base64,{Imagen3UserContractEnconde}"}},

            {"type": "image_url", "image_url": {"url": f"data:image/png;base64,{Imagen4GuiaEncode}"}},
            {"type": "image_url", "image_url": {"url": f"data:image/png;base64,{Imagen4UserContractEnconde}"}},

            {"type": "image_url", "image_url": {"url": f"data:image/png;base64,{Imagen5GuiaEncode}"}},
            {"type": "image_url", "image_url": {"url": f"data:image/png;base64,{Imagen5UserContractEnconde}"}},
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
            ApiResponse(True, nameComplete, "OK","activityReport", idUserContract, idDocumentManagement)
        else:
            razon = arguments.get("razon", "Documento alterado o inválido")
            ApiResponse(False, nameComplete, razon, "activityReport", idUserContract, idDocumentManagement)





# -------------- MAIN ----------------------------------------#
Resultado1 = OneFilter(Imagen1Guia,Imagen1UserContract) 
Resultado2 = OneFilter(Imagen2Guia,Imagen2UserContract)
Resultado3 = OneFilter(Imagen3Guia,Imagen3UserContract)
Resultado4 = OneFilter(Imagen4Guia,Imagen4UserContract)
Resultado5 = OneFilter(Imagen5Guia,Imagen5UserContract)

ResultadoAll = [Resultado1,Resultado2,Resultado3,Resultado4,Resultado5]


for i in ResultadoAll:
     if i <0.90:
        ApiResponse(False,nameComplete,"Las imagenes son muy diferentes entre si","activityReport",idUserContract,idDocumentManagement)
        raise FloatingPointError(f"Resultado {i} No coincide con el esquena")

comparationChatgpt(typeofcontract,contractNumber,startDate,endDate,totalValue,periodValue,extension,addiction,suspension,objectiveContract,nameComplete,idcard,idUserContract,idDocumentManagement,Imagen1Guia,Imagen2Guia,Imagen3Guia,Imagen4Guia,Imagen5Guia,Imagen1UserContract,Imagen2UserContract,Imagen3UserContract,Imagen4UserContract,Imagen5UserContract)