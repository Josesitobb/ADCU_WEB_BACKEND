const { type } = require("express/lib/response");
const mongoose = require("mongoose");

const Collection_Management = new mongoose.Schema({
  certificate_of_compliance: {
    type: Boolean,
    default: false,
  },
    signed_certificate_of_compliance: {
    type: Boolean,
    default: false,
  },
    activity_report: {
    type: Boolean,
    default: false,
  },

    tax_quality_certificate: {
    type: Boolean,
    default: false,
  },
    social_security: {
    type: Boolean,
    default: false,
  },
    rut: {
    type: Boolean,
    default: false,
  },
    rit: {
    type: Boolean,
    default: false,
  },

    Trainings: {
    type: Boolean,
    default: false,
  },
    initiation_record: {
    type: Boolean,
    default: false,
  },
    account_certification: {
    type: Boolean,
    default: false,
  },

 state:{
    type:Boolean,
    default:false
 }
});


module.exports = mongoose.model("Collection_Management",Collection_Management);