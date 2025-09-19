const { type } = require("express/lib/response");
const mongoose = require("mongoose");

// Subesquema para estado y descripción
const StateDescriptionSchema = new mongoose.Schema(
  {
    status: {
      type: Boolean,
      default: false,
    },
    description: {
      type: String,
    },
    usercomparasion: {
      type: String,
    },
    documentManagement: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Document_Management',
      require: ['Es requerido las gestion documental', true]
    },
    contractorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ContactManagement',
      require: ['Es requerido el id del contratista', true]
    }
  },
  { _id: false }
);

// Esquema principal
const DataManagementsSchema = new mongoose.Schema(
  {
    certificate_of_compliance: {
      type: StateDescriptionSchema
    },
    signed_certificate_of_compliance: {
      type: StateDescriptionSchema
    },
    activity_report: {
      type: StateDescriptionSchema
    },
    tax_quality_certificate: {
      type: StateDescriptionSchema
    },
    social_security: {
      type: StateDescriptionSchema
    },
    rut: {
      type: StateDescriptionSchema
    },
    rit: {
      type: StateDescriptionSchema
    },
    Trainings: {
      type: StateDescriptionSchema
    },
    initiation_record: {
      type: StateDescriptionSchema
    },
    account_certification: {
      type: StateDescriptionSchema
    },
  },
  {
    strict: false,
    timestamps: true,
  }
);

module.exports = mongoose.model("Data_Managements", DataManagementsSchema);
