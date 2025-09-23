const { type } = require("express/lib/response");
const mongoose = require("mongoose");

// Subesquema para estado y descripción
const StateDescriptionSchema = new mongoose.Schema(
  {
    status: {
      type: Boolean,
      default: false,
      require: [true, "El estado es requerido"],
    },
    description: {
      type: String,
      require: [true, "La descripcion es requerida"],
    },
    usercomparasion: {
      type: String,
      require: [true, "El usuario de comparacion es requerido"],
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
    filingLetter:{
      type: StateDescriptionSchema,
    },
    certificateOfCompliance: {
      type: StateDescriptionSchema
    },
    signedCertificateOfCompliance: {
      type: StateDescriptionSchema
    },
    activityReport: {
      type: StateDescriptionSchema
    },
    taxQualityCertificate: {
      type: StateDescriptionSchema
    },
    socialSecurity: {
      type: StateDescriptionSchema
    },
    rut: {
      type: StateDescriptionSchema
    },
    rit: {
      type: StateDescriptionSchema
    },
    trainings: {
      type: StateDescriptionSchema
    },
    initiationRecord: {
      type: StateDescriptionSchema
    },
    accountCertification: {
      type: StateDescriptionSchema
    },
  },
  {
    strict: false,
    timestamps: true,
  }
);

module.exports = mongoose.model("dataManagements", DataManagementsSchema);
