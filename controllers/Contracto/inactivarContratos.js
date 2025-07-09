const cron = require('node-cron');
const Contract = require('../../models/Contracto/ContractManagement'); 

cron.schedule("0 2 * * *", async () => {
  console.log("[Cron] Revisando contratos vencidos");

  const today = new Date();

  try {
    const contratosVencidos = await Contract.find({
      endDate: { $lt: today },
      state: "Activo",
    });

    for (const contrato of contratosVencidos) {
      contrato.state = "Inactivo";
      await contrato.save();
      console.log(`Contrato inactivado: ${contrato._id}`);
    }

    console.log("[Cron] Revisión de contratos completada.");
  } catch (error) {
    console.error("[Cron] Error al actualizar contratos:", error.message);
  }
});
