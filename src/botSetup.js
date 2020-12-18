require('dotenv').config();

const TelegramBot = require('node-telegram-bot-api');
const options = {webHook: {port: process.env.PORT}};
const url = process.env.APP_URL;
bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, options);
bot.setWebHook(`${url}/bot${process.env.TELEGRAM_BOT_TOKEN}`);
exports.bot = bot;