const fs = require('node:fs');
const path = require('node:path');
const OpenAI = require('openai');
const dataMagemente = require('../../../models/DataManagements/DataManagements');
const { FILE, ACTIVITYREPORT1, ACTIVITYREPORT2, ACTIVITYREPORT3, ACTIVITYREPORT4, ACTIVITYREPORT5 } = require('../../../config/config');
const { base64image } = require('../../../utils/base64Image');
require("dotenv").config({ path: path.resolve(__dirname, '../../../.env') });

exports.generateActivityReports = async (data) => {
    try {
        // Constantes
        const { typeofcontract, contractNumber, startDate, endDate, totalValue, periodValue, extension, addiction, suspension, objectiveContract, firsName, lastName, idcard, _id, documentManagement } = data;
        // Imagen constante para la comparacion
        const imageConstantPath1 = path.join(__dirname, ACTIVITYREPORT1);
        const imageConstantPath2 = path.join(__dirname, ACTIVITYREPORT2);
        const imageConstantPath3 = path.join(__dirname, ACTIVITYREPORT3);
        const imageConstantPath4 = path.join(__dirname, ACTIVITYREPORT4);
        const imageConstantPath5 = path.join(__dirname, ACTIVITYREPORT5);

        // Buscar las imaganes en la carpeta File
        const imagesDir1 = path.join(__dirname, `${FILE}${_id}img/activityReport1.jpg`);
        const imagesDir2 = path.join(__dirname, `${FILE}${_id}img/activityReport2.jpg`);
        const imagesDir3 = path.join(__dirname, `${FILE}${_id}img/activityReport3.jpg`);
        const imagesDir4 = path.join(__dirname, `${FILE}${_id}img/activityReport4.jpg`);
        const imagesDir5 = path.join(__dirname, `${FILE}${_id}img/activityReport5.jpg`);

        // Verificar que todas las imaganes esten
        if (!fs.existsSync(imagesDir1) || !fs.existsSync(imagesDir2) || !fs.existsSync(imagesDir3) || !fs.existsSync(imagesDir4) || !fs.existsSync(imagesDir5)) {
            throw new Error('El pdf no cumple con el numero de paginas 5');
        }

        // Imagenes del usuario 
        const userImagen1 = base64image(imagesDir1);
        const userImagen2 = base64image(imagesDir2);
        const userImagen3 = base64image(imagesDir3);
        const userImagen4 = base64image(imagesDir4);
        const userImagen5 = base64image(imagesDir5);

        // Imagen constante del sistema para comparar
        const imagenConst1 = base64image(imageConstantPath1);
        const imagenConst2 = base64image(imageConstantPath2);
        const imagenConst3 = base64image(imageConstantPath3);
        const imagenConst4 = base64image(imageConstantPath4);
        const imagenConst5 = base64image(imageConstantPath5);

        // Cliente del chat gpt
        const cliente = new OpenAI({ apikey: process.env.KEYCHATGPT });

        // Crear el prompt
        const response = await cliente.chat.completions.create({
            model: "gpt-5",
            messages: [
                {
                    "role": "system",
                    "content": `Eres un asistente experto en la verificación de documentos legales. "
                            "Tu tarea es analizar imágenes de contratos y el texto extraído por OCR "
                            "para determinar si el documento es auténtico o ha sido alterado. "
                            "Debes verificar estructura, diseño, logos, sellos, coherencia de datos, "
                            "y consistencia entre texto y formato oficial.`

                },
                {
                    "role": "user",
                    "content": `
        Se te proporcionan imágenes y texto OCR de un contrato. 
        Debes realizar las siguientes validaciones:

        ### 1. Validaciones visuales (todas las imágenes)
        - Verifica si la estructura, diseño, tipografía y ubicación de los campos coinciden con documentos oficiales.
        - Verifica que los logos y sellos sean consistentes con documentos oficiales.
        - Revisa signos de alteración (bordes irregulares, tipografía diferente, cambios de color).

        ---

        ### 2. Validaciones de la primera imagen (datos generales del contrato)
        1. Tipo de contrato: ${typeofcontract}
        2. Número y fecha de contrato: ${contractNumber}  | ${startDate}
        3. Nombre del contratista: ${nameComplet}
        4. Número de documento: ${idcard}
        5. Plan de ejecución: desde ${startDate} hasta ${endDate}
        6. Valor total del contrato (números y letras): ${totalValue}
        7. Valor del período de cobro (números y letras): ${periodValue}
        8. Número del proyecto / Imputación presupuestal: debe estar bien escrito.
        9. Fecha de acta de inicio: ${startDate}
        10. Prórroga: si **true** debe haber justificación; si **false** debe decir "N/A". Valor actual: ${extension}
        11. Adición: si **true** debe haber justificación; si **false** debe decir "N/A". Valor actual: ${addiction}
        12. Suspensión: si **true** debe haber justificación; si **false** debe decir "N/A". Valor actual: ${suspension}
        13. Fecha prevista de terminación (incluyendo prórrogas y suspensiones): ${endDate}
        14. Objetivo del contrato debe coincidir con: ${objectiveContract}

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
        - Declaración del contratista → firmado por: ${firsName} ${lastName}, cédula: ${idcard}*
        - Declaración del supervisor y/o interventor → debe estar presente y bien escrito.
        `
                },

                {
                    "role": "user",
                    "content": [
                        { "type": "image_url", "image_url": { "url": `data:image/png;base64,${imagenConst1}` } },
                        { "type": "image_url", "image_url": { "url": `data:image/png;base64,${userImagen1}` } },

                        { "type": "image_url", "image_url": { "url": `data:image/png;base64,${imagenConst2}` } },
                        { "type": "image_url", "image_url": { "url": `data:image/png;base64,${userImagen2}` } },

                        { "type": "image_url", "image_url": { "url": `data:image/png;base64,${imagenConst3}` } },
                        { "type": "image_url", "image_url": { "url": `data:image/png;base64,${userImagen3}` } },

                        { "type": "image_url", "image_url": { "url": `data:image/png;base64,${imagenConst4}` } },
                        { "type": "image_url", "image_url": { "url": `data:image/png;base64,${userImagen4}` } },

                        { "type": "image_url", "image_url": { "url": `data:image/png;base64,${imagenConst5}` } },
                        { "type": "image_url", "image_url": { "url": `data:image/png;base64,${userImagen5}` } },
                    ],
                }

            ],
            tools: [
                {
                    "type": "function",
                    "function": {
                        "name": "AprobarDocumento",
                        "description": "Aprueba o rechaza un documento después de un análisis",
                        "parameters": {
                            "type": "object",
                            "properties": {
                                "id": { "type": "string", "description": "ID del documento analizado" },
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
            tool_choice: { "type": "function", "function": { "name": "AprobarDocumento" } }

        });

        // Respuesta de chat gpt
        const msg = response.choices[0].message;
        const tool_call = msg.tool_calls?.[0];
        const args = JSON.parse(tool_call.function.arguments);

        // Error por si chat gpt no funciona
        if (!tool_call) {
            throw new Error("El modelo no response porfa intentarlo mas tarde")
        }

        // Razon del chatgpt
        const estado = args.estado;
        const razon = args.razon || "Documento alterado o inválido";


        const responseDocuments = new dataMagemente({
            activityReport: {
                status: estado === 'aprobado',
                description: estado == 'ok' ? 'Documento aprobado' : razon,
                usercomparasion: `${firsName}${lastName}`,
                documentManagement: documentManagement,
                contractorId: _id
            }
        });
        await responseDocuments.save();

    } catch (error) {
        throw new Error('Error al generar la comparacion:' + error.message)

    }
}