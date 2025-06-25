const mongoose = require ('mongoose');

const gestionDocumentalSchema = new mongoose.Schema({
    id_gestion_documental:{
        type:Number,
        required: true,
        unique: true
    },
    techa_de_creacion:{
        type:Date,
        required: true
    },
    tiempo_de_cetencion:{
        type:Number,
        required: true
    },
    ip_de_modificacion:{
        type:Number,
        required: true
    },
    estado:{
        type:String,
        required: true
    },
    descripcion:{
        type:String,
        required: true,
        maxlength: 200
    },
    url_del_documento:{
        type:String,
        required: true,
        maxlength:200
    },
    versiond:{
        type:String,
        required: true,
        maxlength: 200
    },
    usuario_de_creacion:{
        type:String,
        required: true,
        maxlength:200
    },
    usuario_de_edicion:{
        type:String,
        required: true,
        maxlength: 200
    },
    gestion_de_contratos_id:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'gestion_de_contratos',
        required: true
    },
    documentos:{
        carta_radicacion_cuenta_de_cobro:{
            type: Buffer,
            ref: 'gestioncontratos',
            required: true
        },
        certificado_de_cumplimiento:{
            type: Buffer,
            required: true
        },
        certificado_de_cumplimiento_firmado:{
            type: Buffer,
            required: true
        },
        informe_de_actividades:{
            type: Buffer,
            required: true
        },
        informe_de_actividades_firmado:{
            type: Buffer,
            required: true
        },
        certificado_de_calidad_contributiva:{
            type:Buffer,
            required: true
        },
        copia_de_planilla_de_pago_seguridad_social:{
            type:Buffer,
            required: true
        },
        rut:{
            type:Buffer,
            required: true
        },
        rit:{
            type:Buffer,
            required: true
        },
        capacitaciones_SST:{
            type:Buffer,
            required: true
        },
        acta_de_inicio:{
            type:Buffer,
            required:true
        },
        certificado_de_cuenta_bancaria:{
            type:Buffer,
            required:true
        },
    }
},{
    timestamps: true,
    versionKey: false
});
//Middleware para validar la referencia a gestión de contratos
gestionDocumentalSchema.pre('save', async function(next){
    try{
        const gestionContratos = await mongoose.model('gestionContratos').findById(this.gestion_de_contratos_id);
        if(!gestionContratos){
            throw new Error ('El contarto referenciado no exixte ');
        }
        next();
    }catch(error){
        next(error);
    }
});

const  gestionDocumental = mongoose.model('gestionDocumental', gestionDocumentalSchema);
module.exports = gestionDocumental;