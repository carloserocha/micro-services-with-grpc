const path = require('path');

const {
    Sequelize,
    Model,
    DataTypes
} = require('sequelize');
const sequelize = new Sequelize('sqlite::memory:', {
    logging: console.log,
    storage: path.join(__dirname, 'customer.sqlite')
});

class Customer extends Model {}

Customer.init({
    name: DataTypes.STRING,
    taxvat: DataTypes.STRING,
    email: DataTypes.STRING,
    telephone: DataTypes.STRING,
    cellphone: DataTypes.STRING,
    dob: DataTypes.STRING
}, {
    sequelize,
    modelName: 'customer'
});

async function initialization() {
    try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');

        await Customer.sync({
            force: false
        });
        console.log("All models were synchronized successfully.");
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
}

async function close() {
    try {
        await sequelize.close();
        console.log('Connection has been established closed.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
}

module.exports = {
    Model: Customer,
    initialization,
    close
}