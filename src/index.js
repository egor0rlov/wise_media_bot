require('dotenv').config();

const {bot} = require('./botSetup');
const {Button, BotAnswer, RegEx} = require('./strings');
const {State} = require('./consts');
const Keyboard = require('./keyboards').Keyboard;
const {ArticlesManager} = require('./ApiManagers/articlesManager');
const {NewsManager} = require('./ApiManagers/newsManager');

const news = new NewsManager(bot);
let state = State.regular;
let articles;

//Main screen handlers:
bot.onText(RegEx.start, async (msg) => {
    const chatId = msg.chat.id;
    state = State.regular;

    await bot.sendMessage(chatId, BotAnswer.whatDoYouWant, {
        reply_markup: {
            keyboard: Keyboard.main
        },
    });
});

bot.onText(RegEx.toMain, (async (msg) => {
    const chatId = msg.chat.id;
    state = State.regular;

    await bot.sendMessage(chatId, BotAnswer.whatDoYouWant, {
        reply_markup: {
            keyboard: Keyboard.main
        },
    });
}));

//Materials handlers:
bot.onText(RegEx.materials, async (msg) => {
    articles = new ArticlesManager(bot, Button);

    await articles.fetchArticles().then(() => {
        articles.sendArticlesList(msg);
    });
});

bot.on('callback_query', async (query) => {
    const data = query.data;

    if (articles && (data === '1' || data === '-1')) {
        await articles.updateInlineMessage(query);
    } else if (data !== '0') {
        const chatId = query.message.chat.id;
        const linkToSend = 'https://telegra.ph/' + data;

        await bot.sendMessage(chatId, linkToSend);
    }
});

//News request handlers:
bot.onText(RegEx.newsSearch, async (msg) => {
    const chatId = msg.chat.id;
    state = State.newsSearcher;

    await bot.sendMessage(chatId, BotAnswer.enterRequest, {
        reply_markup: {
            keyboard: Keyboard.toMain
        }
    });
});

bot.onText(RegEx.anotherRequest, async (msg) => {
    const chatId = msg.chat.id;
    state = State.newsSearcher;

    await bot.sendMessage(chatId, BotAnswer.enterRequest);
});

bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const isReadyToSendNews = state === State.newsSearcher && msg.text && msg.text !== Button.toMain;

    if (isReadyToSendNews) {
        state = State.regular;

        await news.fetchNewsFromWeb(msg.text);

        if (news.news.length) {
            await news.sendNews(chatId);

            await bot.sendMessage(chatId, BotAnswer.anythingElse, {
                reply_markup: {
                    keyboard: Keyboard.anotherRequest
                }
            });
        } else {
            await bot.sendMessage(chatId, BotAnswer.noNews, {
                reply_markup: {
                    keyboard: Keyboard.anotherRequest
                }
            });
        }
    } else if (!msg.text) {
        await bot.sendMessage(chatId, BotAnswer.isItSticker);
    }
});