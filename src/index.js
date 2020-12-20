const {bot} = require('./apiManagers/botSetup');
const {WiseMediaUserModel, addUserIfNotInDb, cleanDatabase, getUserBy, updateUserBy} = require('./apiManagers/mongoManager');
const WiseUser = WiseMediaUserModel;
const {Button, BotAnswer, RegEx} = require('./consts/strings');
const {State} = require('./consts/consts');
const {getChatId, userIsAdmin} = require('./utils');
const Keyboard = require('./consts/keyboards').Keyboard;
const {ArticlesManager} = require('./apiManagers/articlesManager');
const {NewsManager} = require('./apiManagers/newsManager');
const articles = new ArticlesManager(bot);
const news = new NewsManager(bot);

//Main screen handlers:
bot.onText(RegEx.start, async (msg) => {
    await addUserIfNotInDb(WiseUser, msg);
    await updateUserBy(WiseUser, {tgId: msg.from.id}, {botState: State.regular});

    await bot.sendMessage(getChatId(msg), BotAnswer.whatDoYouWant, {
        reply_markup: {
            keyboard: getMainKeyboard(msg)
        },
    });
});

bot.onText(RegEx.toMain, (async (msg) => {
    await addUserIfNotInDb(WiseUser, msg);
    await updateUserBy(WiseUser, {tgId: msg.from.id}, {botState: State.regular});

    await bot.sendMessage(getChatId(msg), BotAnswer.whatDoYouWant, {
        reply_markup: {
            keyboard: getMainKeyboard(msg)
        },
    });
}));

//Materials handlers:
bot.onText(RegEx.materials, async (msg) => {
    await addUserIfNotInDb(WiseUser, msg);
    await articles.fetchArticles().then(() => {
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
    await addUserIfNotInDb(WiseUser, msg);
    await updateUserBy(WiseUser, {tgId: msg.from.id}, {botState: State.newsSearcher});

    await bot.sendMessage(getChatId(msg), BotAnswer.enterRequest, {
        reply_markup: {
            keyboard: Keyboard.toMain
        }
    });
});

bot.onText(RegEx.anotherRequest, async (msg) => {
    await addUserIfNotInDb(WiseUser, msg);
    await updateUserBy(WiseUser, {tgId: msg.from.id}, {botState: State.newsSearcher});

    await bot.sendMessage(getChatId(msg), BotAnswer.enterRequest, {
        reply_markup: {
            keyboard: Keyboard.toMain
        }
    });
});

bot.on('message', async (msg) => {
    const chatId = getChatId(msg);
    let isReadyToSendNews
    await getUserBy(WiseUser, {tgId: msg.from.id}).then((user) => {
        isReadyToSendNews = user.botState === State.newsSearcher && msg.text && msg.text !== Button.toMain;

        if (isReadyToSendNews) {
            updateUserBy(WiseUser, {tgId: msg.from.id}, {botState: State.regular});

            news.fetchNewsFromWeb(msg.text).then(() => {
                if (news.newsList.length) {
                    news.sendNews(chatId);

                    bot.sendMessage(chatId, BotAnswer.anythingElse, {
                        reply_markup: {
                            keyboard: Keyboard.anotherRequest
                        }
                    });
                } else {
                    bot.sendMessage(chatId, BotAnswer.noNews, {
                        reply_markup: {
                            keyboard: Keyboard.anotherRequest
                        }
                    });
                }
            });
        } else if (!msg.text) {
            bot.sendMessage(chatId, BotAnswer.isItSticker);
        }
    });
});

//Admin handlers:
bot.onText(RegEx.adminMenu, async (msg) => {
    if (userIsAdmin(msg)) {
        await bot.sendMessage(getChatId(msg), BotAnswer.welcomeAdmin, {
            reply_markup: {
                keyboard: Keyboard.adminMenu
            }
        });
    } else {
        await bot.sendMessage(getChatId(msg), BotAnswer.youAreNotAdmin);
    }
});

bot.onText(RegEx.clearUsers, async (msg) => {
    if (userIsAdmin(msg)) {
        await cleanDatabase(WiseUser, bot, msg);
    } else {
        await bot.sendMessage(getChatId(msg), BotAnswer.youAreNotAdmin);
    }
});

//Functions:
function getMainKeyboard(msg) {
    const keyboard = [...Keyboard.main]; //Spread to avoid changing initial buttons array

    if (userIsAdmin(msg)) {
        keyboard.push([Button.adminMenu]);
    }

    return keyboard;
}

function getAdminKeyboard(msg) {
    if (userIsAdmin(msg)) {
        return Keyboard.adminMenu;
    }
}