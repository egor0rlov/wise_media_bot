const {bot} = require('./botSetup');
const {WiseMediaUserModel, clearPageNumberOrAddUser} = require('./apiManagers/mongoManager');
const WiseUser = WiseMediaUserModel;
const {Button, BotAnswer, RegEx} = require('./consts/strings');
const {State} = require('./consts/consts');
const Keyboard = require('./consts/keyboards').Keyboard;
const {ArticlesManager} = require('./apiManagers/articlesManager');
const {NewsManager} = require('./apiManagers/newsManager');
const articles = new ArticlesManager(bot);
const news = new NewsManager(bot);
let state = State.regular;

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
    await clearPageNumberOrAddUser(WiseUser, msg);
    await articles.fetchArticles(msg).then(() => {
        articles.sendArticlesList(msg);
    });
});

bot.on('callback_query', async (query) => {
    const data = query.data;

    if (articles.articlesList && (data === articles.nextPage || data === articles.prevPage)) {
        await articles.updateInlineMessage(query);
    } else if (data === articles.firstPage) {
        await articles.updateInlineMessage(query, 0);
    } else if (data === articles.randomPage) {
        const randomPage = Math.floor(Math.random() * Math.floor(articles.articlesList.length / 10));
        await articles.updateInlineMessage(query, randomPage);
    } else {
        await articles.sendArticleLink(query);
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

        if (news.newsList.length) {
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