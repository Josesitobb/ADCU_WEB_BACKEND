const fs = require("fs/promises");
const path = require("path");

async function convertPdfToImages(pathDocument, outputDir, baseName) {
  try {
    const { pdf } = await import("pdf-to-img"); 

    let counter = 1;
    const document = await pdf(pathDocument, { scale: 1 });

    for await (const image of document) {
      // const pathSaved = path.join(outputDir, `${baseName}_page${counter}.jpg`);
      const pathSaved = path.join(outputDir, `${baseName}${counter}.jpg`);
      await fs.writeFile(pathSaved, image);
      counter++;
    }
  } catch (error) {
    console.log(error);
  }
}

module.exports = convertPdfToImages;
