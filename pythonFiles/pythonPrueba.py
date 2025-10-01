import os
from dotenv import load_dotenv

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), "..", ".env"))
IMAGEUSUARIO= os.getenv("IMAGENDELUSUARIO")
contenido = os.listdir(f"{IMAGEUSUARIO}/68d2aa12c050975bf0e184f8Img")


print(contenido)
for archivo in contenido:
    print(archivo)