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
            allowNull: true,
            validate: {
                isDate: true
            }
        },
        dayType: {
            type: DataTypes.ENUM('weekday', 'weekend', 'holiday', 'specific'),
            allowNull: false
        },
        openTime: {
            type: DataTypes.STRING,  // Format: HH:mm
            allowNull: false,
            validate: {
                is: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
                isValidTime(value) {
                    const [hours, minutes] = value.split(':').map(Number);
                    if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
                        throw new Error('Invalid time format');
                    }
                }
            }
        },
        closeTime: {
            type: DataTypes.STRING,  // Format: HH:mm
            allowNull: false,
            validate: {
                is: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
                isValidTime(value) {
                    const [hours, minutes] = value.split(':').map(Number);
                    if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
                        throw new Error('Invalid time format');
                    }
                },
                isAfterOpenTime(value) {
                    const [closeHours, closeMinutes] = value.split(':').map(Number);
                    const [openHours, openMinutes] = this.openTime.split(':').map(Number);
                    if (closeHours < openHours || (closeHours === openHours && closeMinutes <= openMinutes)) {
                        throw new Error('Close time must be after open time');
                    }
                }
            }
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true
        },
        description: {
            type: DataTypes.STRING,
            allowNull: true,
            validate: {
                len: [0, 255]
            }
        }
    }, {
        timestamps: true,
        indexes: [
            {
                unique: true,
                fields: ['dayType', 'date'],
                where: {
                    isActive: true
                }
            }
        ],
        validate: {
            dateRequiredForSpecific() {
                if (this.dayType === 'specific' && !this.date) {
                    throw new Error('Date is required for specific day type');
                }
            }
        }
    });

    return BusinessHours;
};
