import requests

def ApiResponse(State,UserComparasaion,Description,DocumenteCompare,IdUserComparasion,IdDocumentManagement):
    url = "http://localhost:3000/api/Data/saved"
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
        print(response.text)
        return response.json()
    except requests.exceptions.RequestException as error:
        print(f"Error during API request: {error}")
        return {"success": False, "message": str(error)}
    