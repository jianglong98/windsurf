const { DataTypes } = require('sequelize');
const bcrypt = require('bcrypt');

module.exports = (sequelize) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
      validate: {
        isEmail: true,
        customValidator(value) {
          // If email is empty, ensure phone is provided
          if (!value && !this.phone) {
            throw new Error('Either email or phone must be provided');
          }
        }
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: true // Null for regular users, only admins have passwords
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        customValidator(value) {
          // If phone is empty, ensure email is provided
          if (!value && !this.email) {
            throw new Error('Either email or phone must be provided');
          }
        }
      }
    },
    isAdmin: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  }, {
    hooks: {
      beforeCreate: async (user) => {
        if (user.password) {
          user.password = await bcrypt.hash(user.password, 10);
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed('password') && user.password) {
          user.password = await bcrypt.hash(user.password, 10);
        }
      }
    }
  });

  // Instance method to validate password
  User.prototype.validatePassword = async function(password) {
    try {
      console.log('Validating password:');
      console.log('Input password length:', password ? password.length : 0);
      console.log('Stored hash exists:', !!this.password);
      console.log('Stored hash first 20 chars:', this.password ? this.password.substring(0, 20) + '...' : 'none');
      
      if (!this.password) {
        console.log('No password stored for user');
        return false;
      }
      
      const result = await bcrypt.compare(password, this.password);
      console.log('bcrypt.compare result:', result);
      return result;
    } catch (error) {
      console.error('Password validation error:', error);
      return false;
    }
  };

  return User;
};
