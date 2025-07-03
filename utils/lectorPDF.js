const pdfParse = require('pdf-parse');

// Extrae texto completo desde un archivo PDF (en formato buffer)
async function extraer_texto_desde_buffer(buffer) {
  try {
    const data = await pdfParse(buffer);
    return data.text || '';
  } catch (error) {
    console.error('❌ Error al extraer texto del PDF:', error);
    return '';
  }
}

// Analiza el texto y verifica que los campos estén presentes y no vacíos
function extraer_campos(texto) {
  const resultados = {};

  const patrones = {
    nombre_alcalde: /alcaldesa\s+(?:local\s+)?(?:doctora\s+)?([A-ZÁÉÍÓÚÑ\s]+)/i,
    periodo_cobrar_cdr: /comprendido del\s+["']?(.+?)["']?(?:\s|$)/i,
    valor_cobrar_cdr: /la suma de[:\s]+(.+?pesos)/i,
    rut: /\bRUT\b/,
    tipo_cuenta: /tipo de cuenta[:\s]+(.+?)(?=[\n\r])/i,
    correo: /correo(?:\s+electr[oó]nico)?[:\s]+([a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+)/i,
    firma_alcalde: /firma(?:\s+de(?:l)?\s+alcalde(?:sa)?)?/i
  };

  for (const campo in patrones) {
    const patron = patrones[campo];
    const match = texto.match(patron);
    resultados[campo] = match ? `✅ Encontrado: ${match[1] || match[0]}` : `❌ No encontrado`;
  }

  return resultados;
}

module.exports = {
  extraer_texto_desde_buffer,
  extraer_campos
};