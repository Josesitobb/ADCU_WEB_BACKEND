module.exports = (sequelize, DataTypes) => {
    const Report = sequelize.define('Report', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        originalFileName: {
            type: DataTypes.STRING,
            allowNull: false
        },
        modifiedFileName: {
            type: DataTypes.STRING,
            allowNull: false
        },
        originalFilePath: {
            type: DataTypes.STRING,
            allowNull: false
        },
        modifiedFilePath: {
            type: DataTypes.STRING,
            allowNull: false
        },
        reportFilePath: {
            type: DataTypes.STRING
        },
        uploadedBy: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Users',
                key: 'id'
            }
        },
        approvedBy: {
            type: DataTypes.INTEGER,
            references: {
                model: 'Users',
                key: 'id'
            }
        },
        rejectedBy: {
            type: DataTypes.INTEGER,
            references: {
                model: 'Users',
                key: 'id'
            }
        },
        status: {
            type: DataTypes.ENUM('uploaded', 'processed', 'approved', 'rejected'),
            defaultValue: 'uploaded'
        },
        changesDetected: {
            type: DataTypes.TEXT, // JSON stringificado
            get() {
                const rawValue = this.getDataValue('changesDetected');
                return rawValue ? JSON.parse(rawValue) : null;
            },
            set(value) {
                this.setDataValue('changesDetected', JSON.stringify(value));
            }
        },
        errorCount: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        }
    });

    Report.associate = function(models) {
        Report.belongsTo(models.User, { as: 'Uploader', foreignKey: 'uploadedBy' });
        Report.belongsTo(models.User, { as: 'Approver', foreignKey: 'approvedBy' });
        Report.belongsTo(models.User, { as: 'Rejecter', foreignKey: 'rejectedBy' });
    };

    return Report;
};