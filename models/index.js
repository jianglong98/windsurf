const { Sequelize } = require('sequelize');
const path = require('path');

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, '../database.sqlite'),
    logging: false
});

const Service = require('./service')(sequelize);
const Booking = require('./booking')(sequelize);
const BusinessHours = require('./businessHours')(sequelize);

// Define relationships
Service.hasMany(Booking);
Booking.belongsTo(Service);

// Sync and seed initial data if needed
const seedDatabase = async () => {
    try {
        // Add default services if none exist
        const serviceCount = await Service.count();
        if (serviceCount === 0) {
            await Service.bulkCreate([
                {
                    name: 'Swedish Massage',
                    description: 'Classic relaxation massage using long, flowing strokes to reduce tension and promote wellness.',
                    duration: 60,
                    price: 80.00
                },
                {
                    name: 'Deep Tissue Massage',
                    description: 'Therapeutic massage targeting deep muscle layers to relieve chronic tension and pain.',
                    duration: 60,
                    price: 95.00
                },
                {
                    name: 'Hot Stone Massage',
                    description: 'Relaxing massage using heated stones to melt away tension and promote deep relaxation.',
                    duration: 75,
                    price: 110.00
                },
                {
                    name: 'Sports Massage',
                    description: 'Targeted massage for athletes and active individuals to enhance performance and recovery.',
                    duration: 60,
                    price: 90.00
                }
            ]);
        }

        // Add default business hours if none exist
        const hoursCount = await BusinessHours.count();
        if (hoursCount === 0) {
            await BusinessHours.bulkCreate([
                {
                    dayType: 'weekday',
                    openTime: '09:00',
                    closeTime: '17:00'
                },
                {
                    dayType: 'weekend',
                    openTime: '10:00',
                    closeTime: '16:00'
                }
            ]);
        }
    } catch (error) {
        console.error('Error seeding database:', error);
    }
};

// Call seedDatabase after syncing
sequelize.sync()
    .then(seedDatabase)
    .catch(err => console.error('Error syncing database:', err));

module.exports = {
    sequelize,
    Service,
    Booking,
    BusinessHours
};
