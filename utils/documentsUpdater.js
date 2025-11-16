const dataMagemente = require('../models/DataManagements/DataManagements');

async function documentsCreate(userComparasion,contractorId,documentManagement,status,descripcion,document) {
    
    let response = await dataMagemente.findOne({contractorId:contractorId});

    if(!response){
        response = new dataMagemente({
            usercomparasion:userComparasion,
            contractorId:contractorId,
            documentManagement:documentManagement
        });
    }

    response[document]={
        status:status ==='aprobado',
        description: descripcion=='ok'?'Documento aprobado':descripcion
    }

   return await response.save();
}

module.exports = documentsCreate;