const path = require("path");
const { exec } = require("child_process");
const express = require("express");

function pythonExecute(scriptName, data = []) {
  //Ejecuta el comando
  const campodepython ="C:/Users/JoseD/AppData/Local/Programs/Python/Python313/python.exe";
  // Ruta del python entra a la carpeta
  const scriptPath = path.resolve(__dirname, `../controllers/Data_management/${scriptName}.py`);

  const comando = `"${campodepython}" "${scriptPath}" ${data.map(a => `"${a}"`).join(" ")}`;

console.log("Comando a ejecutar:", comando);

  return new Promise((resolve, reject) => {
    exec(comando, (error, stdout, stderr) => {
      if (error) {
        console.error(`[Python ERROR]:`, error);
        return reject(error);
      }
      if (stderr) {
        console.warn(` STDERR: ${stderr}`);
      }
      resolve(stdout);
    });
  });

};

module.exports = pythonExecute;
