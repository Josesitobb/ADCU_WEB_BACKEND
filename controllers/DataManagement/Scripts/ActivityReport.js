const fs = require('node:fs');
const path = require('node:path');
const OpenAI  = require('openai');
const dataMagemente = require('../../../models/DataManagements/DataManagements');
const { FILE,ACTIVITYREPORT,ACTIVITYREPORT2,ACTIVITYREPORT3,ACTIVITYREPORT4,ACTIVITYREPORT5 } = require('../../../config/config');
const {base64image} = require('../../../utils/base64Image');
require("dotenv").config({path:path.resolve(__dirname,'../../../.env')});


exports.generateActivityReports = async(data)=>{
    // Constantes
    
    
}