const fs = require("node:fs");
const path = require("node:path");
const OpenAI = require("openai");
const dataMagemente = require("../../../models/DataManagements/DataManagements");
const {
  FILE,
  RIT,
} = require("../../../config/config");
const documentsCreate=require('../../../utils/documentsUpdater');
const { base64image } = require("../../../utils/base64Image");
require("dotenv").config({ path: path.resolve(__dirname, "../../../.env") });

exports.generateRit = async (data) => {
  try {
    // Constantes
    const {
      firsName,
      lastName,
      idcard,
      email,
      telephone,
      residentialAddress,
      _id,
      documentManagement,
    } = data;
    // Imagen constante para la comparacion
    const imageConstantPath1 = path.join(__dirname, RIT);


    // Buscar las imaganes en la carpeta File
    const imagesDir1 = path.join(
      __dirname,
      `${FILE}${_id}/Img/rit1.jpg`
    );
    // Verificar que todas las imaganes esten
    if (!fs.existsSync(imagesDir1)) {
      throw new Error("El pdf no cumple con el numero de paginas 1");
    }

    // Imagenes del usuario
    const userImagen1 = base64image(imagesDir1);
   
    // Imagen constante del sistema para comparar
    const imagenConst1 = base64image(imageConstantPath1);

    // Cliente del chat gpt
    const cliente = new OpenAI({apiKey:process.env.KEYCHATGPT});

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
        
       1.Verificar el contribuyente Numero de cedula ${idcard} y nombre ${firsName} ${lastName}
       2.Verificar que sea un rit de 
       3.Encabezado de INFORMACION BASICA
       4.Verificar direccion ${residentialAddress} en las imagenes y el texto OCR.
       5.Verificar numero de telefono ${telephone} en las imagenes y el texto OCR.
       6.Verifica direccion de correo electronico ${email} en las imagenes y el texto OCR.
       7.Verificar el municipio en las imagenes y el texto OCR.
       8.Encabezado PERFIL TRIBUTARIO
       9.Verificar si esta esta escrito:Naturaleza Juridica , Regimen tributario, Fecha desde, Matricula Mercantil,Fecha inicio de Actividades,Fecha de cese de Actividad, No.Establecimineots (Tienes que estar algo al ado ejemplo No.Establecimientos: 1 o puede ser NO)
       10.Las actividades tiene que estar en numero y descripcion 
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
    const userComparasion = `${firsName} ${lastName}`
    return await documentsCreate(userComparasion,_id,documentManagement,estado,razon,'rit');
  } catch (error) {
    throw new Error("Error al generar la comparacion:" + error.message);
  }
};
