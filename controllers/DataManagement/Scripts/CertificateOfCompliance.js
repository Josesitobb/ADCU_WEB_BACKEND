const fs = require("node:fs");
const path = require("node:path");
const OpenAI = require("openai");
const dataMagemente = require("../../../models/DataManagements/DataManagements");
const documentsCreate = require("../../../utils/documentsUpdater");
const { FILE, CERTIFICATEOFCOMPLIANCE } = require("../../../config/config");
const { base64image } = require("../../../utils/base64Image");
require("dotenv").config({ path: path.resolve(__dirname, "../../../.env") });

exports.generateCertificateOfCompliance = async (data) => {
  try {
    // Constantes
    const {
      contractNumber,
      typeofcontract,
      objectiveContract,
      startDate,
      endDate,
      periodValue,
      totalValue,
    } = data.contract;
    const { firsName, lastName, idcard } = data.user;
    const { _id, documentManagement } = data;
    // Imagen constante para la comparacion
    const imageConstantPath = path.join(__dirname, CERTIFICATEOFCOMPLIANCE);

    // Buscar las imaganes en la carpeta File
    const imagesDir = path.join(
      __dirname,
      `${FILE}${_id}/Img/certificateOfCompliance1.jpg`
    );

    // Verifica si la ruta del path existe
    if (!fs.existsSync(imagesDir)) {
      throw new Error("No existe el archivo aun");
    }
    // Imagen del usuario
    const userImagen = base64image(imagesDir);
    // Imagen constante del sistema para comparar
    const imagenConst = base64image(imageConstantPath);

    // Cliente de OpenAI
    const cliente = new OpenAI({ apiKey: process.env.KEYCHATGPT });

    // Crear el prompt
    const response = await cliente.chat.completions.create({
      model: "gpt-5",
      messages: [
        {
          role: "system",
          content: ` "Eres un asistente experto en la verificación de documentos legales. "
            "Tu tarea es analizar imágenes de contratos y el texto extraído por OCR "
            "para determinar si el documento es auténtico o ha sido alterado. "
            "Debes verificar estructura, diseño, logos, sellos, coherencia de datos, "
            "y consistencia entre texto y formato oficial se te va a pasar una imaganes de guia para que veas como son los logos etc..."
        `,
        },
        {
          role: "user",
          content: `
                    Compara estas dos imaganes de de certificado de cumplimiento. La primera imagen es un esquema o un ejemplo y la segunda ya es la imagen del usuario.
                    
                    Validacion visuales
                    -Verifica si tiene la misma estructura, diseño, tipografia y ubicacion de los campos.
                    -Verifica si los logos y sellos son consistentes con los documentos oficiales.
                    -Verifica si hay signos de alteracion, como bordes irregulares, diferencias en la tipografia o el color.
                    
                    Validaciones de texto (usando OCR):
                    0.El numero de contrato debe coincidir con: ${contractNumber}
                    1.El tipo de contrato debe coincidir con: ${typeofcontract}
                    2.El nombre del contratista debe coincidir con: ${firsName} ${lastName}
                    3.El numero de identificacion debe coincidir con: ${idcard}
                    4.El obejtivo del contrato debe coincidir con: ${objectiveContract}
                    5.La fecha de inicio debe coincidir con: ${startDate}
                    6.La fecha de finalizacion debe coincidir con: ${endDate}
                    7.El plazo de contrato debe coincidir con la duracion en meses: ${startDate} a ${endDate}
                    8.El valor del contrato debe coincidir con: ${totalValue}
                    9.El valor del periodo debe coincidir con: ${periodValue}
                    10.No tiene que estar firmado por el representante legal de la entidad contratante
                    `,
        },
        {
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: { url: `data:image/png;base64,${imagenConst}` },
            },
            {
              type: "image_url",
              image_url: { url: `data:image/png;base64,${userImagen} ` },
            },
          ],
        },
      ],
      // Herramienta
      tools: [
        {
          type: "function",
          function: {
            name: "AprobarDocumento",
            description:
              "Aprueba o rechaza un documento después de un análisis",
            parameters: {
              type: "object",
              properties: {
                id: { type: "string", description: "ID del documento " },
                estado: {
                  type: "string",
                  enum: ["aprobado", "rechazado"],
                  description: "Resultado de la validación del documento",
                },
                razon: {
                  type: "string",
                  description: "Si es rechazado, explica el motivo",
                },
              },
              required: ["id", "estado"],
            },
          },
        },
      ],
      tool_choice: { type: "function", function: { name: "AprobarDocumento" } },
    });

    // Respuesta de chat gpt
    const msg = response.choices[0].message;
    const tool_call = msg.tool_calls?.[0];
    const args = JSON.parse(tool_call.function.arguments);

    // Error por si chat gpt no funciona
    if (!tool_call) {
      throw new Error("El modelo no response porfa intentarlo mas tarde");
    }

    // Razon del chatgpt
    const estado = args.estado;
    const razon = args.razon || "Documento alterado o inválido";

    // Nombre completo
    const userComparasion = `${firsName} ${lastName}`;
    return await documentsCreate(
      userComparasion,
      _id,
      documentManagement,
      estado,
      razon,
      "certificateOfCompliance"
    );
  } catch (error) {
    throw new Error("Error al generar la comparacion:" + error.message);
  }
};
