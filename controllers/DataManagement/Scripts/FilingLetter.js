const fs = require('node:fs');
const path = require('node:path');
const OpenAI  = require('openai');
const dataMagemente = require('../../../models/DataManagements/DataManagements');
const { FILE,FILINGLETTER } = require('../../../config/config');
const {base64image} = require('../../../utils/base64Image');
require("dotenv").config({path:path.resolve(__dirname,'../../../.env')});

exports.generateFilingLetter = async (data) => {
    try{
    // Constantes
    const { firsName, lastName, idcard, telephone,email,typeofcontract,residentialAddress,startDate,endDate,contractNumber,periodValue,_id,documentManagement } = data;
    // Imagen constante para la comparacion
    const imageConstantPath = path.join(__dirname,FILINGLETTER);
    // Buscar las imaganes en la carpeta File
    const imagesDir = path.join(__dirname,`${FILE}${_id}img/filingLetter1.jpg`);

    if(!fs.existsSync(imagesDir)){
        throw new Error('La carta de archivo no ha sido generada aún.');
    }
    // Imagen del usuario
    const userImagen = base64image(imagesDir);
    // Imagen constante del sistema para comparar
    const imagenConst = base64image(imageConstantPath);

    // Cliente de OpenAI 
    const cliente = new OpenAI({apiKey:process.env.KEYCHATGPT});

    // Crear el prompt
    const response = await cliente.chat.completions.create({
        model :"gpt-5",
        messages:[
            {
                "role": "system",
                "content": "Eres un experto en validación de documentos visuales y contractuales."
            },
            {
            "role": "user",
            "content": `
            Compara estas dos imágenes de contrato. La primera imagen es un esquema o un ejemplo y la segunda ya es la imagen del usuario

            🔎 Validaciones visuales:
            - Verifica si tienen la misma estructura, diseño, tipografía y ubicación de los campos.
            - Solo deben variar los siguientes campos:
                1. El número de pago que sea un numero 
                2. El número de contrato de prestación de servicios ${contractNumber}
                3. El tipo de contrato → ${typeofcontract}
                4. El nombre del contratista → ${firsName +''+ lastName}
                5. El número de cédula → ${idcard}
                6. Teléfono → ${telephone}
                7. Correo electrónico → ${email}
                8. Dirección → ${residentialAddress}
                9. Fecha de inicio → ${startDate}
                10. Fecha de finalización → ${endDate}
                11. La suma, el concepto, la cuenta bancaria y los datos de pago
                12. Firma

            📅 Validaciones de fecha:
            - La fecha de inicio es ${startDate} y la de finalización es ${endDate} (formato ISO) del CONTRATO EN EL DOCUMENTO GUIA DICE " durante el 
            periodo comprendido del 03 al 31 de enero de 2025".
            - Verifica que correspondan al PERIODO escrito en el contrato (ejemplo en el documento: "del 26 de junio de 2025 al 30 de agosto de 2025").
            - Rechaza si las fechas no coinciden con el rango que aparece en el documento.

            💰 Validaciones de valor:
            - El precio real del contrato es ${periodValue} (viene sin puntos , ejemplo 120000).
            - En el documento debe aparecer correctamente escrito con separadores de miles o por comas tambien (ejemplo: "120.000" o "120,000").
            - Verifica también que la SUMA EN LETRAS coincida con ese valor numérico.
            - Rechaza si hay diferencia entre la cifra numérica y la cantidad escrita en letras.

            👤 Validaciones de identidad:
            - El contratista debe ser ${firsName} ${lastName} identificado con cédula ${idcard}.
            - El teléfono debe ser ${telephone}, el correo ${email} y la dirección ${residentialAddress}.

            🚫 Rechazo:
            - Si detectas que la estructura del documento fue alterada.
            - Si existen cambios en campos que no están permitidos en la lista anterior.
            - Si las fechas, el tipo de contrato, la identidad del contratista o los montos no coinciden exactamente con lo esperado.

            Responde únicamente con 'aprobado' o 'rechazado' y una breve explicación del motivo.
            `
        },
        {
            "role": "user",
            "content": [
                {"type": "image_url", "image_url": {"url": `data:image/png;base64,${imagenConst}`}},
                {"type": "image_url", "image_url": {"url": `data:image/png;base64,${userImagen}`}}
            ]
        }],
        // Herramienta
        tools:[
                {
                    "type": "function",
                    "function": {
                        "name": "AprobarDocumento",
                        "description": "Aprueba o rechaza un documento después de un análisis",
                        "parameters": {
                            "type": "object",
                            "properties": {
                                "id": {"type": "string", "description": "ID del documento "},
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
            tool_choice:{"type": "function", "function": {"name": "AprobarDocumento"}}
    });

    // Respuesta de chat gpt
    const msg = response.choices[0].message;
    const tool_call = msg.tool_calls?.[0];
    const args = JSON.parse(tool_call.function.arguments);

    // Error por si chat gpt no funciona
    if(!tool_call){
        throw new Error("El modelo no response porfa intentarlo mas tarde")
    }

    // Razon del chatgpt
    const estado = args.estado;
    const razon = args.razon || "Documento alterado o inválido";

    // Respuesta al servidor
    const responseDocuments = new dataMagemente({
    filingLetter:{
     status:estado ==='aprobado',
     description:estado =='ok'?'Documento aprobado':razon,
     usercomparasion:`${firsName }${lastName}`,
     documentManagement:documentManagement,
     contractorId:_id
        }
    });
    await responseDocuments.save();
}
catch(error){
    throw new Error('Error al generar la carta de archivo: ' + error.message);
}
}