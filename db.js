const { Sequelize } = require("sequelize");

module.exports = new Sequelize("omnius_bot", "root", "root123root", {
	host: "master.79dabcc5-5d56-4406-8553-9fd15bd609c6.c.dbaas.selcloud.ru",
	port: "5432",
	dialect: "postgres",
});
