import os
import requests
from pdfminer.high_level import extract_text
from datetime import datetime
import fitz  # PyMuPDF
import re

# 🧠 Esquemas por cada PDF
CAMPOS_POR_PDF = {
"pdf_1.pdf": {
    "nombre_alcaldesa": [
        "doctora", "alcaldesa local",  # Contexto para encontrar el nombre
        "alexandra mejia guzman"  # También lo dejamos como ref directa
    ],
    "direccion_alcaldia": [
        "alcaldía local de chapinero", "carrera 13", "no. 54 – 74"
    ],
    "periodo_cobro": [
        "periodo comprendido del", "enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre", "2025", "2024"
    ],
    "valor_en_letras": [
        "la suma de", "millones", "mil", "pesos", "$"
    ],
    "banco": ["banco", "lulo bank"],
    "numero_cuenta": ["cuenta", "379581444922"],
    "tipo_de_cuenta": ["cuenta de ahorros", "cuenta corriente"],
    "firma": ["🔍 Validar visualmente"]
    },
    "pdf_2.pdf": {
        "nombre_contratista": ["contratista", "nombre"],
        "periodo_comprometido": ["periodo", "comprometido"],
        "cedula": ["cédula", "cedula"],
        "fecha_inicio": [
            "fecha de inicio", "fecha iniciación", "inicio del contrato",
            "inició el contrato", "inicio:", "fecha inicial"
        ],
        "fecha_fin": ["fecha de terminación", "fin"],
        "valor_inicial_pactado": ["valor inicial", "valor pactado"],
        "valor_pagar": ["valor a pagar", "pagar"],
        "numero_pin": ["pin"],
        "firma_hash": ["🔍 Validar visualmente"],
        "nombre_supervisor": ["🔍 Validar visualmente"],
        "cedula_supervisor": ["🔍 Validar visualmente"],
        "firma": ["🔍 Validar visualmente"]
    },
    "pdf_3.pdf": {
        "tipo_contrato": ["tipo de contrato"],
        "numero_contrato_fecha": ["número de contrato", "no. contrato", "contrato y fecha"],
        "nombre_contratista": ["nombre del contratista"],
        "tipo_documento": ["c.c", "nit", "identificación", "número de documento"],
        "plazo_ejecucion": ["plazo de ejecución"],
        "valor_total_contrato": ["valor total del contrato"],
        "valor_periodo_cobro": [
            "valor del periodo de cobro", "valor periodo cobro", "valor del periodo",
            "valor cobrar", "valor a pagar", "siete millones", "7.971.600", "$7.971.600"
        ],
        "numero_proyecto": ["número del proyecto", "imputación presupuestal"],
        "fecha_acta_inicio": ["fecha acta de inicio", "inicio"],
        "prorroga": ["prórroga"],
        "adicion": ["adición"],
        "suspension": ["suspensión"],
        "fecha_prevista_terminacion": [
            "fecha prevista de terminación", "fecha de terminación", "prevista para terminar",
            "terminación prevista", "terminación"
        ]
    },
    "pdf_4.pdf": {
        "numero_contrato": ["número de contrato"],
        "tabla_informacion_personal": ["x sí", "x no", "soy pensionado", "declaración de renta", "actividad económica"],
        "nombre": ["alba stella falkonerth rozo"],
        "cedula": ["52779382"],
        "direccion_correspondencia": ["calle 145", "correspondencia"],
        "telefono_contacto": ["3222806398"],
        "correo_institucional": ["afalkonerth@gobiernobogota.gov.co"],
        "correo_personal": ["annyf", "@gmail", "@hotmail"]
    },
    "pdf_5.pdf": {
        "verificado": ["✅ Subido con éxito"]
    },
    "pdf_6.pdf": {
        "verificado": ["✅ Subido con éxito"]
    },
    "pdf_7.pdf": {
        "identificacion_nombre": ["c.c.", "cedula", "alba stella", "falkonerth", "contratista"]
    },
    "pdf_8.pdf": {
        "imagenes_encontradas": ["__IMAGENES__"]
    },
    "pdf_9.pdf": {
        "nombre_contratista": ["nombre del contratista", "contratista", "nombre"],
        "valor": ["valor", "$", "total"],
        "plazo": ["plazo", "meses", "días", "dias"],
        "firma_validar_visualmente": ["🔍 Validar visualmente"],
        "firmado_alcaldia_chapinero": ["🔍 Validar visualmente"]
    },
    "pdf_10.pdf": {
        "verificado": ["__SUBIDO__"]
    }
}

CARPETA_PDFS = os.getcwd()

def extraer_texto(ruta_pdf):
    try:
        return extract_text(ruta_pdf).lower()
    except Exception as e:
        print(f"❌ Error al extraer texto: {e}")
        return ""

def contiene_imagenes(ruta_pdf):
    try:
        doc = fitz.open(ruta_pdf)
        for page in doc:
            if len(page.get_images(full=True)) > 0:
                return True
        return False
    except Exception as e:
        print(f"❌ Error verificando imágenes en {ruta_pdf}: {e}")
        return False

def verificar_campos(texto, campos, archivo):
    resultados = {}
    for campo, palabras_clave in campos.items():
        if palabras_clave == ["🔍 Validar visualmente"]:
            resultados[campo] = "🔍 Validar visualmente"
        elif palabras_clave == ["✅ Subido con éxito"]:
            resultados[campo] = "✅ Subido con éxito"
        elif palabras_clave == ["__IMAGENES__"]:
            resultados[campo] = "✅ Imágenes detectadas" if contiene_imagenes(os.path.join(CARPETA_PDFS, archivo)) else "❌ No hay imágenes"
        elif palabras_clave == ["__SUBIDO__"]:
            resultados[campo] = "✅ Subido con éxito"
        else:
            encontrado = any(palabra in texto for palabra in palabras_clave)
            resultados[campo] = "✅" if encontrado else "❌ No encontrado"
    return resultados

def guardar_en_mongo(nombre_archivo, resultados):
    url = "http://localhost:3000/api/documentos"
    datos = {
        "archivo_pdf": nombre_archivo,
        "fecha_comparacion": datetime.now().isoformat()
    }
    for campo, estado in resultados.items():
        datos[campo] = estado

    try:
        res = requests.post(url, json=datos)
        if res.status_code == 201:
            print(f"✅ Documento '{nombre_archivo}' guardado correctamente en MongoDB\n")
        else:
            print(f"❌ Error al guardar: {res.status_code} - {res.text}\n")
    except Exception as e:
        print(f"❌ Error de conexión al guardar en MongoDB: {e}\n")

# 🔁 Revisión por archivo (ordenados)
archivos_pdf_ordenados = sorted(
    [f for f in os.listdir(CARPETA_PDFS) if re.match(r"pdf_\d+\.pdf$", f)],
    key=lambda x: int(re.findall(r'\d+', x)[0])
)

for archivo in archivos_pdf_ordenados:
    print(f"\n📄 Verificando campos en: {archivo}")
    texto = extraer_texto(os.path.join(CARPETA_PDFS, archivo))

    esquema = CAMPOS_POR_PDF.get(archivo.lower())
    if not esquema:
        print("⚠️ No hay esquema definido para este PDF. Se marca como subido.")
        guardar_en_mongo(archivo, {"verificado": "✅ Subido con éxito"})
        continue

    resultados = verificar_campos(texto, esquema, archivo)

    print("╒════════════════════╤══════════╕")
    print("│ Campo              │ Estado   │")
    print("╞════════════════════╪══════════╡")
    for campo, estado in resultados.items():
        print(f"│ {campo:<18} │ {estado:<8} │")
    print("╘════════════════════╧══════════╛")

    guardar_en_mongo(archivo, resultados)