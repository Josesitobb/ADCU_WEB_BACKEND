const Subcategory = require('../models/Subcategory');
const Category = require('../models/Category');

// Crear subcategoria
exports.createSubcategory = async (req, res) => {
    try {
        const { name, description, category } = req.body;
        // Validar que la categoria existe
        const parentCategory = await Category.findById(category);
        if (!parentCategory) {
            return res.status(404).json({
                success: false,
                message: 'La categoria no existe'
            });
        }

        const newSubcategory = new Subcategory({
            name: name.trim(),
            description: description.trim(),
            category
        });

        await newSubcategory.save();

        res.status(201).json({
            success: true,
            message: 'Subcategoria creada exitosamente',
            data: newSubcategory
        });
    } catch (error) {
        console.error("Error al crear la subcategoria:", error);

        if (error.message.includes('duplicate Key') || error.message.includes('Ya existe')) {
            return res.status(404).json({
                success: false,
                message: 'Ya exite una subcateogria con ese nombre'
            })
        }
        res.status(500).json({
            success: false,
            message: error.message || 'Error la crear subcategoria'
        });
    }
};

// Obtener todas las subcategorias
exports.getSubcategories = async (req, res) => {
    try {
        const Subcategories = await Subcategory.find().populate('category', 'name');
        res.status(200).json({
            success: true,
            data: Subcategories
        });
    } catch (error) {
        console.error('Error al obtener subcategorias', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener subcategorias'
        });
    }
};

// Obtener subcategorias por id
exports.getSubcategoryById = async (req, res) => {
    try {
        const subcategory = await Subcategory.findById(req.params.id).populate('category', 'name');
        if (!subcategory) {
            return res.status(404).json({
                success: false,
                message: 'Subcategoria no encontrada'
            });
        }
        res.status(200).json({
            success: true,
            data: subcategory
        });
    } catch (error) {
        console.error('Error al obtener la subcategoria');
        res.status(500).json({
            success: false,
            message: 'Error al obtener la subcategoria'
        });
    }
};

// Actualizar Subcategoria
exports.updateSubcategory = async (req, res) => {
    try {
        const { name, description, category } = req.body;

        // Veriricar si se cambia la categoria

        if (category) {
            const parentCategory = await Category.findById(category);
            if (!parentCategory) {
                return res.status(404).json({
                    success: false,
                    message: 'La categoria no existe'
                });
            }
        }

        const updateSubcategory = await Subcategory.findByIdAndUpdate(req.params.id, {
            name: name ? name.trim() : undefined,
            description: description ? description.trim() : undefined,
            category
        },
            { new: true, runValidators: true }
        );

        if (!updateSubcategory) {
            return res.status(404).json({
                success: false,
                message: 'Subcategoria no encontrada'
            });
        }
        res.status(200).json({
            success: true,
            message: 'Subcategoria  actualizada'
        });
    } catch (error) {
        console.error('Error  al actualizar subcategoria', error)
        res.status(500).json({
            success: false,
            message: 'Error al actualizar la subcateogria'
        });
    }

};

// Eliminar subcategorias

exports.deleteSubcategory = async (req, res) => {
    try {
        const deletedSubcategory = await Subcategory.findByIdAndDelete(req.params.id);
        if (!deletedSubcategory) {
            return res.status(404).json({
                success: false,
                message: 'Subcategoria no encontrada'
            });
        }
        res.status(200).json({
            success: true,
            message: 'Subcategoria eliminada'
        })
    } catch (error) {
        console.error('Erro al eliminar subcategoria', error)
        res.status(500).json({
            success: false,
            message: 'Error al eliminar subcateogira'
        });
    }
};