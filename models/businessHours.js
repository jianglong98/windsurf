const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const BusinessHours = sequelize.define('BusinessHours', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        date: {
            type: DataTypes.DATEONLY,
            allowNull: true
        },
        dayType: {
            type: DataTypes.ENUM('weekday', 'weekend', 'specific'),
            allowNull: false
        },
        openTime: {
            type: DataTypes.STRING,  // Format: HH:mm
            allowNull: false,
            validate: {
                is: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
            }
        },
        closeTime: {
            type: DataTypes.STRING,  // Format: HH:mm
            allowNull: false,
            validate: {
                is: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
            }
        },
        description: {
            type: DataTypes.STRING,
            allowNull: true
        }
    }, {
        timestamps: true,
        indexes: [
            {
                unique: true,
                fields: ['dayType'],
                where: {
                    date: null
                }
            }
        ]
    });

    return BusinessHours;
};
