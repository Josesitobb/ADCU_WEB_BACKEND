import cv2
import base64
from skimage.metrics import structural_similarity as ssim
import pytesseract
from openai import OpenAI
import json
import sys
import requests
import os
# Variable para iniciar esa mierda
pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

# # Parametro que va recibir desde Node.JS
# if len(sys.argv) <8:
#     print('falta argumentos por recibir')
#     raise FileNotFoundError(f"No se recibieron los parametros suficientes para el analisis porfavor volver a intentar")
    
try: 
    IdDocumentManagement = sys.argv[1]
    IdUserContract = sys.argv[2]
    nameContract = sys.argv[3]
    idcard = sys.argv[4]
    telephone = sys.argv[5]
    starteDate = sys.argv[6]
    endDate = sys.argv[7]
    price = sys.argv[8]
    carpeta = sys.argv[9]
    
except Exception as error:
    print(error)


# print("Argumentos recibidos desde Node:")
# print("IdDocumentManagement:", IdDocumentManagement)
# print("IdUserContract:", IdUserContract)
# print("nameContract:", nameContract)
# print("idcard:", idcard)
# print("telephone:", telephone)
# print("starteDate:", starteDate)
# print("endDate:", endDate)
# print("price:", price)
# print("carpeta:", IdUserContract)
# Imagen1 = r"C:\Users\JoseD\OneDrive\Documentos\ADCU_WEB_BACKEND\controllers\Data_management\Prueba1.jpg"
# Imagen2 = r"C:\Users\JoseD\OneDrive\Documentos\ADCU_WEB_BACKEND\controllers\Data_management\Prueba2.jpg"

# Imagen costante
Imagen1 = r"C:\Users\JoseD\OneDrive\Documentos\ADCU\ADCU_WEB_BACKEND\utils\Img\filing_letter.jpg"


Imagen2 = r"C:\Users\JoseD\OneDrive\Documentos\ADCU\ADCU_WEB_BACKEND\Files\68a71182eff6e937480fe6f8Img\filing_letter.jpg"

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

# -------------- Funcion extraer el texto --------------------#
def CoordenadasImagen(Diccionario,Imagen,id):
        datos = pytesseract.image_to_data(Imagen,output_type=pytesseract.Output.DICT)
        for i in range(len(datos['text'])):
            PalabrasDeLaImagen = datos['text'][i]
            if i in id:
                x= datos['left'][i]
                y = datos['top'][i]
                w = datos['width'][i]
                h = datos['height'][i] 
                Diccionario[i] = {
                            'id':i,
                            'palabra':PalabrasDeLaImagen,
                            'left':x,
                            'top':y,
                            'width':x+w,
                            'height':y+h   
                        }
# -------------- Funcion para traer a chat gpt --------------------#
def ComparararChatgpt(Imagen1,Imagen2):
    KEY="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"
    def encode_image(image_path):
        with open(image_path,"rb") as image_file:
            return base64.b64encode(image_file.read()).decode("utf-8")
    ImagenGuia = encode_image(Imagen1)
    ImagenUsuario = encode_image(Imagen2)
    client = OpenAI(api_key=KEY)

    response = client.chat.completions.create(
    model="gpt-5",
    # temperature=0.2,
    messages=[
        {
            "role": "system",
            "content": "Eres un experto en validación de documentos visuales."
        },
        {
            "role": "user",
            "content": """Compara estas dos imágenes. Verifica si tienen la misma estructura,
            diseño, tipografía y ubicación de los campos. Solo debe cambiar los valores:
             1. El número de pago
             2. El número de contrato de prestación de servicios
             3. El nombre, la suma y el concepto
             4. La cuenta bancaria y los datos
             5. Firma, número de cédula, email, teléfono y dirección"""
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
                        "id": {
                            "type": "string",
                            "description": "ID del documento analizado"
                        },
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

    # print(response.choices[0].message.tool_calls[0].function.name)
    msg = response.choices[0].message
    tool_call = msg.tool_calls[0]
    function_name = tool_call.function.name
    arguments =json.loads(tool_call.function.arguments) 
    estado = arguments.get("estado")
    
    

    
    if estado == "aprobado":
        UrlApi("aprobado",nameContract,'OK',IdUserContract,IdDocumentManagement)
    else:
        razon = arguments.get("razon")
        UrlApi("rechazado",nameContract,razon,IdUserContract,IdDocumentManagement)
        
#-------------- Funcion para comparar ----------------------------------------#
def CompararDocumentos(DocumenGuia,Imagen2):
    ImagenUsuario = pytesseract.image_to_data(Imagen2,output_type=pytesseract.Output.DICT)
    palabrasEncontradas = []
    tolerancia =20
    for i in range(len(ImagenUsuario['text'])):
        palabra_detectada = ImagenUsuario['text'][i]
        
        for dato in DocumenGuia.values():
            if dato['palabra'] ==  palabra_detectada:
                #Usuario 
                leftUsuario = ImagenUsuario['left'][i]
                palabraUsuario = ImagenUsuario['text'][i]
                topUsuario = ImagenUsuario['top'][i]
    
                #Guia
                leftGuia = dato['left']
                palabraGuia = dato['palabra']
                topGuia = dato['top']
                
                contador = 0
                if abs(leftUsuario - leftGuia)>tolerancia:
                    #  print(f"La palabra guia: {palabraGuia}, palabra usuario: {palabraUsuario}, leftGuia:{leftGuia}, leftUsuario: {leftUsuario}")
                     contador=contador+1
                
                if abs(topUsuario - topGuia)>tolerancia:
                    #  print(f"La palabra guia : {palabraGuia}, palabra usuario: {palabraUsuario}, topGuia:{topGuia}, topUsuario: {topUsuario}")
                     contador=contador+1
                     
                if contador == 0:
                    palabrasEncontradas.append(palabraUsuario)
           
    return len(palabrasEncontradas)
       
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
        response = requests.post(url,json=data,headers={"Content-Type": "application/json; charset=utf-8"}
                                 
                                 
                                 
                                 )
        print("Data enviada:", data)
        print("Respuesta:", response.status_code, response.text)
  
        return response.json()
    except requests.exceptions.RequestException as error:
        return {"success": False, "message": str(error)}
        
    
    
# -------------- MAIN ----------------------------------------#
if primerFiltro(Imagen1,Imagen2) >= 0.90:
    DocumenGuia = {}
    id = [4,5,6,7,8,9,13,16,17,18,20,21,24,25,26,27,29,30,31,32,33,36,99,100,102,108,109,126,237,255,239,241,246,247,248,252,254,256,281,286,289,292]
    CoordenadasImagen(DocumenGuia,Imagen1,id)
    
    resultado = CompararDocumentos(DocumenGuia,Imagen2)
    print(resultado)

    if resultado >42:
       ComparararChatgpt(Imagen1,Imagen2)
    else:
        
        print("Al documento le pueden faltar algunas palabras porfa revisar ")
else:
    print("Documento no pasa porfavor descargue otra y vuelvalo a intentar")
    UrlApi("rechazado",nameContract,'El documento no cumple con el esquema',IdUserContract,IdDocumentManagement)