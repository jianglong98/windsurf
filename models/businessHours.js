const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const BusinessHours = sequelize.define('BusinessHours', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    dayOfWeek: {
      type: DataTypes.INTEGER, // 0 = Sunday, 1 = Monday, etc.
      allowNull: false,
      validate: {
        min: 0,
        max: 6
      }
    },
    openTime: {
      type: DataTypes.TIME,
      allowNull: false
    },
    closeTime: {
      type: DataTypes.TIME,
      allowNull: false
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  });

  return BusinessHours;
};
