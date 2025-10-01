import requests
from dotenv import load_dotenv
import os
import sys
import io


sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '..', '.env'))

HOST = os.getenv("HOST")

def ApiResponse(State,UserComparasaion,Description,DocumenteCompare,IdUserComparasion,IdDocumentManagement):
    url = f"http://{HOST}:5000/api/Data/saved"
    data={
        "Field":str(DocumenteCompare),
        "Status":bool(State),
        "Usercomparasion":str(UserComparasaion),
        "Description":str(Description),
        "IdUserComparasion":str(IdUserComparasion),
        "IdDocumentManagement":str(IdDocumentManagement)  
    }
    try:
        response = requests.post(url,json=data,headers={"Content-Type": "application/json; charset=utf-8"})
        print(response.status_code)
        # 🔹 Reemplaza caracteres no soportados por la terminal
        print(response.text.encode("utf-8", errors="replace").decode("utf-8"))
        return response.json()
    except requests.exceptions.RequestException as error:
        print(f"Error during API request: {error}")
        return {"success": False, "message": str(error)}
