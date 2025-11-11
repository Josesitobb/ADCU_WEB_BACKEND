const fs = require("node:fs");
const path = require("node:path");
const OpenAI = require("openai");
const dataMagemente = require("../../../models/DataManagements/DataManagements");
const { FILE } = require("../../../config/config");
const { base64image } = require("../../../utils/base64Image");
require("dotenv").config({ path: path.resolve(__dirname, "../../../.env") });

exports.generateActivityReports = async (data) => {
  try {
    // Constantes
    const {
      firsName,
      lastName,
      idcard,
     email,
     telephone,
      _id,
      documentManagement,
    } = data;
    

    // Buscar las imaganes en la carpeta File
    const imagesDir1 = path.join(__dirname, `${FILE}${_id}img/accountCertification1.jpg`);
    // Verificar que todas las imaganes esten
    if (!fs.existsSync(imagesDir1)) {
      throw new Error("El pdf no cumple con el numero de paginas 1");
    }

    // Imagenes del usuario
    const userImagen1 = base64image(imagesDir1);

    const cliente = new OpenAI({ apikey: process.env.KEYCHATGPT });

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
Se te proporcionan imágenes y texto OCR de un certificacion calidad tributaria contratista. 
        Debes realizar las siguientes validaciones:
        
        Primera imagen
        1.Verifca que el documento sea un cuenta bancaria oficial
        2.Verifica que el nombre del contratista ${firsName} ${lastName} coincida con el nombre en la imagen
        3.Verifica que el numero de identificacion tributaria ${idcard} coincida con el numero en la imagen
        Posiblemente se te puede pedir que verifiques si salen:
        4.Verifica que el email ${email} coincida con el email en la imagen
        5.Verifica que el telefono ${telephone} coincida con el telefono en la imagen
        `,
        },

        {
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: { url: `data:image/png;base64,${userImagen1}` },
            },
          ],
        },
      ],
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
                id: {
                  type: "string",
                  description: "ID del documento analizado",
                },
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

    const responseDocuments = new dataMagemente({
      accountCertification: {
        status: estado === "aprobado",
        description: estado == "ok" ? "Documento aprobado" : razon,
        usercomparasion: `${firsName}${lastName}`,
        documentManagement: documentManagement,
        contractorId: _id,
      },
    });
    await responseDocuments.save();
  } catch (error) {
    throw new Error("Error al generar la comparacion:" + error.message);
  }
};
