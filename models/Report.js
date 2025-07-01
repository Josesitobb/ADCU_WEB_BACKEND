module.exports = (sequelize, DataTypes) => {
    const Report = sequelize.define('Report', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        type: {
            type: DataTypes.STRING,
            allowNull: false
        },
        dataRange: {
            type: DataTypes.STRING
        },
        generatedBy: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Users',
                key: 'id'
            }
        }
    });

    Report.associate = function(models) {
        Report.belongsTo(models.User, { foreignKey: 'generatedBy' });
    };

    return Report;
};