const sequelize = require("./db");

const { DataTypes } = require("sequelize"); //Импорт типов данных

const User = sequelize.define("user", {
	id: {
		type: DataTypes.INTEGER,
		primaryKey: true,
		unique: true,
		autoIncrement: true,
	},
	chatID: { type: DataTypes.STRING, unique: true },
	right: { type: DataTypes.INTEGER, defaultValue: 0 },
	wrong: { type: DataTypes.INTEGER, defaultValue: 0 },
});

module.exports = User;
