require('dotenv').config();

const TelegramBot = require('node-telegram-bot-api');
const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const options = {webHook: {port: process.env.PORT}};
const url = process.env.APP_URL;
bot = new TelegramBot(TOKEN, options);
bot.setWebHook(`${url}/bot${TOKEN}`);
exports.bot = bot;