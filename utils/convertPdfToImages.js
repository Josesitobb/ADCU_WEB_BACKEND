const fs = require("node:fs/promises");
const path = require("node:path");

async function convertPdfToImages(pathDocument, outputDir, baseName,counterImg) {
  try {
    const { pdf } = await import("pdf-to-img"); 

    let counter = 1;
    const document = await pdf(pathDocument, { scale: 1 });

   

    for await (const image of document) {
      // const pathSaved = path.join(outputDir, `${baseName}_page${counter}.jpg`);
      const pathSaved = path.join(outputDir, `${baseName}${counter}.jpg`);
      await fs.writeFile(pathSaved, image);
      counter++;
      
      // Cantidad de imaganes que se van a permitir
      if(counter > counterImg)break;
    }
  } catch (error) {
    console.log(error);
  }
}

module.exports = convertPdfToImages;
