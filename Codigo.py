import requests
from bs4 import BeautifulSoup
import json

# URL con los códigos
url = "https://www.gerencie.com/codigos-de-actividades-economicas.html"

# Descargar contenido
response = requests.get(url)
soup = BeautifulSoup(response.text, "html.parser")

# Buscar todas las filas de la tabla
tabla = soup.find("table")
filas = tabla.find_all("tr")

codigos = []

for fila in filas:
    columnas = fila.find_all("td")
    if len(columnas) == 2:
        codigo = columnas[0].get_text(strip=True)
        descripcion = columnas[1].get_text(strip=True)
        codigos.append({
            "codigo": codigo,
            "descripcion": descripcion
        })

# Guardar como JSON
with open("codigos_actividad_economica.json", "w", encoding="utf-8") as f:
    json.dump(codigos, f, ensure_ascii=False, indent=2)

print("✅ Archivo generado: codigos_actividad_economica.json")
