const fs = require("node:fs");
const path = require("node:path");
const OpenAI = require("openai");
const dataMagemente = require("../../../models/DataManagements/DataManagements");
const {
  FILE,
  TAXQUIANLITYCERTIFICATE1,
  TAXQUIANLITYCERTIFICATE2,
} = require("../../../config/config");
const documentsCreate = require("../../../utils/documentsUpdater");
const { base64image } = require("../../../utils/base64Image");
require("dotenv").config({ path: path.resolve(__dirname, "../../../.env") });

exports.generateTaxQuanlityCertificate = async (data) => {
  try {
    console.log(data);
    // Constantes
    const { contractNumber } = data.contract;
    const { firsName, lastName, idcard, email, telephone } = data.user;
    const { institutionalEmail, residentialAddress, _id, documentManagement } =
      data;
    // Imagen constante para la comparacion
    const imageConstantPath1 = path.join(__dirname, TAXQUIANLITYCERTIFICATE1);
    const imageConstantPath2 = path.join(__dirname, TAXQUIANLITYCERTIFICATE2);

    // Buscar las imaganes en la carpeta File
    const imagesDir1 = path.join(
      __dirname,
      `${FILE}${_id}/Img/taxQualityCertificate1.jpg`
    );
    const imagesDir2 = path.join(
      __dirname,
      `${FILE}${_id}/Img/taxQualityCertificate2.jpg`
    );
    // Verificar que todas las imaganes esten
    if (!fs.existsSync(imagesDir1) || !fs.existsSync(imagesDir2)) {
      throw new Error("El pdf no cumple con el numero de paginas 2");
    }

    // Imagenes del usuario
    const userImagen1 = base64image(imagesDir1);
    const userImagen2 = base64image(imagesDir2);

    // Imagen constante del sistema para comparar
    const imagenConst1 = base64image(imageConstantPath1);
    const imagenConst2 = base64image(imageConstantPath2);

    // Cliente del chat gpt
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
         Se te proporcionan imágenes y texto OCR de un certificacion calidad tributaria contratista. 
        Debes realizar las siguientes validaciones:
        
        Primera imagen
        
        1.Verificar el numero de contrato ${contractNumber} en las imagenes y el texto OCR.
        2.Verificar que el nombre del contratista ${firsName} ${lastName} coincida en las imagenes y el texto OCR.
        3.Verificar que el numero de identificacion ${idcard} coincida en las imagenes y el texto OCR.
        4.Verificar que la primera tabla tenga un encabezado de INFORMACION PERSONAL, tambien que en la parte si y no este con una X
        5.Verificar que la segunda tabla tenga un encabezado de DEPURACION CALCULO DE RENTE, tambien que en la parte si y no este con una X
        
        Segunda imagen
        
        6.Verificar que la tercera tabla tenga un encabezado de DEPURACION CALCULO DE RENTA, tambien que en la parte si y no este con una X
        7.Verificar que tenga la firma del contratista
        8.Verificar que este el nombre del contratista ${lastName} ${firsName} al lado de la firma
        9.Verificar que tenga el numero de identificacion ${idcard} al lado de la firma
        10.Verificar que tenga la dirrecion de correspondecia ${residentialAddress}
        11.Verificar que tenga el telefono de contact ${telephone}
        12.Verificar que tenga el email ${email}
        13.Verificar que tenga el email institucional ${institutionalEmail}
        """
        `,
        },

        {
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: { url: `data:image/png;base64,${imagenConst1}` },
            },
            {
              type: "image_url",
              image_url: { url: `data:image/png;base64,${userImagen1}` },
            },

            {
              type: "image_url",
              image_url: { url: `data:image/png;base64,${imagenConst2}` },
            },
            {
              type: "image_url",
              image_url: { url: `data:image/png;base64,${userImagen2}` },
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

    // Nombre completo
    const userComparasion = `${firsName} ${lastName}`;
    return await documentsCreate(
      userComparasion,
      _id,
      documentManagement,
      estado,
      razon,
      "taxQualityCertificate"
    );
  } catch (error) {
    throw new Error("Error al generar la comparacion:" + error.message);
  }
};
