//Импортируем пакет telegram bot api
const TelegramApi = require("node-telegram-bot-api");

//Импортируем кнопки
const { gameOptions, againOptions } = require("./options.js");

//Импортируем объект БД
const sequelize = require("./db");

//Импорт модели БД
const UserModel = require("./models.js");

//Токе телеграм-бота
const token = "6691942551:AAGV6jCNsu86RrMeC93srKv8BvvlrnfJZr4";

//Создаем объект бота
const bot = new TelegramApi(token, { polling: true });

//Словарь для хранения загаданных чисел:
// key - chatID
// value - randomNum
const chats = {};

const startGame = async chatId => {
	await bot.sendMessage(
		chatId,
		`Сейчас я загадаю цифру от 0 до 9, а ты должен его отгадать`
	);
	const randomNumber = Math.floor(Math.random() * 10);
	console.log(randomNumber);
	chats[chatId] = randomNumber;
	await bot.sendMessage(chatId, `Отгадывай`, gameOptions);
};

//Функция запуска приложения
const start = async () => {
	//Подключение к БД
	try {
		await sequelize.authenticate(); //Подключение к БД
		await sequelize.sync(); //Синхронизация таблиц в коде с таблицами в БД
	} catch (e) {
		console.log("Подключение к БД сломалось", e);
	}
	//Установка команд бота
	bot.setMyCommands([
		{ command: "/start", description: "Начальное приветствие" },
		{ command: "/info", description: "Получить информацию о пользователе" },
		{ command: "/game", description: "Игра 'Отгадай число'" },
	]);

	//Вешаем слушатель событий на обработку полученных сообщений
	bot.on("message", async msg => {
		console.log(msg); //Тело callback
		const text = msg.text; //Текст сообщения
		const chatId = msg.chat.id; //Id чата
		//bot.sendMessage(chatId, `Ты мне написал ${text}`); //Отправка сообщения от имени бота

		try {
			if (text === "/start") {
				await UserModel.create({ chatId });
				await bot.sendSticker(
					chatId,
					"https://tlgrm.ru/_/stickers/67e/60c/67e60c3e-98b9-3cf5-8338-1c71364df6d2/6.webp"
				); //Отправка стикера
				return bot.sendMessage(
					chatId,
					`Добро пожаловать в телеграм бот OmniusTest`
				);
			}

			if (text === "/info") {
				const user = await UserModel.findOne({ chatId });
				return bot.sendMessage(
					chatId,
					`Тебя зовут ${msg.from.first_name} ${msg.from.last_name}, в игре у тебя правильных ответов ${user.right}, неправитных ${user.wrong}`
				);
			}

			if (text === "/game") {
				return startGame(chatId);
			}

			return bot.sendMessage(chatId, `Я тебя не понимаю, попробуй еще раз!`);
		} catch (e) {
			return bot.on(chatId, "Произошла какая-то ошибка");
		}
	});

	bot.on("callback_query", async msg => {
		const data = msg.data;
		const chatId = msg.message.chat.id;
		//bot.sendMessage(chatId, `Ты выбрал цифру ${data}`);
		if (data === "/again") {
			return startGame(chatId);
		}

		const user = await UserModel.findOne({ chatId });

		if (Number(data) === chats[chatId]) {
			user.right += 1;
			await user.save();
			await bot.sendMessage(chatId, `Поздравляю ты отгадал`, againOptions);
		} else {
			user.wrong += 1;
			await user.save();
			await bot.sendMessage(
				chatId,
				`Ты не угадал, я загадал ${chats[chatId]}`,
				againOptions
			);
		}
		//await user.save();
	});
};

start();
