//Импортируем пакет telegram bot api
const TelegramApi = require("node-telegram-bot-api");

//Импортируем кнопки
const { gameOptions, againOptions } = require("./options.js");

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
const start = () => {
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
		if (text === "/start") {
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
			return bot.sendMessage(
				chatId,
				`Тебя зовут ${msg.from.first_name} ${msg.from.last_name}`
			);
		}

		if (text === "/game") {
			return startGame(chatId);
		}

		return bot.sendMessage(chatId, `Я тебя не понимаю, попробуй еще раз!`);
	});

	bot.on("callback_query", msg => {
		const data = msg.data;
		const chatId = msg.message.chat.id;
		//bot.sendMessage(chatId, `Ты выбрал цифру ${data}`);
		if (data === "/again") {
			return startGame(chatId);
		}
		if (Number(data) === chats[chatId]) {
			return bot.sendMessage(chatId, `Поздравляю ты отгадал`, againOptions);
		} else {
			return bot.sendMessage(
				chatId,
				`Ты не угадал, я загадал ${chats[chatId]}`,
				againOptions
			);
		}
	});
};

start();
