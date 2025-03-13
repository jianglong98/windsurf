const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Service = sequelize.define('Service', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        duration: {
            type: DataTypes.INTEGER,  // Duration in minutes
            allowNull: false,
            validate: {
                min: 15,  // Minimum 15 minutes
                max: 180  // Maximum 3 hours
            }
        },
        price: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            validate: {
                min: 0
            }
        },
        active: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        }
    }, {
        timestamps: true
    });

    return Service;
};
