const path = require("path");
const { exec } = require("child_process");
const express = require("express");
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });


function pythonExecute(scriptName, data = []) {
  //Ejecuta el comando
  const campodepython = process.env.URLDELPYTHON; 
  // Ruta del python entra a la carpeta
  const scriptPath = path.resolve(__dirname, `../pythonFiles/${scriptName}.py`);

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
