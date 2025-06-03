const { DataSource } = require('typeorm');
const ormConfig = require('./ormconfig');

const AppDataSource = new DataSource(ormConfig);

module.exports = AppDataSource;
