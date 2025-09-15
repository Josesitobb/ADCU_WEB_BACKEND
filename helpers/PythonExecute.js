const path = require("path");
const { exec } = require("child_process");

function pythonExecute(scriptName, data = []) {
  //Ejecuta el comando
  const campodepython ="C:/Users/JoseD/AppData/Local/Programs/Python/Python313/python.exe";
  // Ruta del python entra a la carpeta
  const scriptPath = path.resolve(__dirname,`../../controllers/Data_management/${scriptName}.py`);

  const comando = `"${campodepython}" "${scriptPath} ${data.map(a=>`"${a}"`).join(" ")}"`;

   exec(comando, (error, stdout, stderr) => {
    if (error) {
           console.error(`[Python ERROR]:`, error);
           return res
             .status(500)
             .json({ message: "Error ejecutando script Python" });
         }
   
         if (stderr) {
           console.warn(` STDERR: ${stderr}`);
         }
   
         console.log(`✅ STDOUT:\n${stdout}`);
         return res.status(200).json({
           message: "Script ejecutado correctamente",
           output: stdout.trim(),
         });
       });


};

module.exports = pythonExecute;
