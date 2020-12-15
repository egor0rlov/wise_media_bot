/**
 * Imports:
 */

require('dotenv').config();

const TelegramBot = require('node-telegram-bot-api');
const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const options = {webHook: {port: process.env.PORT}};
const url = process.env.APP_URL;
const bot = new TelegramBot(TOKEN, options);
bot.setWebHook(`${url}/bot${TOKEN}`);

const NewsAPI = require('newsapi');
const NEWS_TOKEN = process.env.NEWS_API_TOKEN;
const news = new NewsAPI(NEWS_TOKEN);

const Button = require('./strings').Button;
const BotAnswer = require('./strings').BotAnswer;
const RegEx = require('./strings').RegEx;
const State = require('./consts').State;
const Keyboard = require('./keyboards').Keyboard;

let articles;
const fetchMyArticles = require('./articlesUtils').fetchMyArticles;

const dayjs = require('dayjs');

/**
 * Variables:
 */

let state = State.regular;
let inlinePageNumber;

//Bot logic section---------------------------------------------------------------------------------------------------//

/**
 * Main screen handlers:
 */

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

/**
 * Materials handlers:
 */

bot.onText(RegEx.materials, async (msg) => {
    inlinePageNumber = 0;

    articles = await fetchMyArticles();

    await sendArticlesList(msg);
});

bot.on('callback_query', async (query) => {
    const data = query.data;

    if (data === '1' || data === '-1') {
        await updateLastInlineMessage(query);
    } else if (data !== '0') {
        const chatId = query.message.chat.id;
        const linkToSend = 'https://telegra.ph/' + data;

        await bot.sendMessage(chatId, linkToSend);
    }
});

/**
 * News request handlers:
 */

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

    if (state === State.newsSearcher && msg.text && msg.text !== Button.toMain) {
        state = State.regular;

        const weekRelevance = dayjs().subtract(1, 'week').format('YYYY-MM-DD');
        const articles = await fetchNewsFromWeb(msg.text, weekRelevance);

        const requestArticlesAmount = 5;

        if (articles.length) {
            try {
                await sendNews(chatId, articles, requestArticlesAmount);
            } catch (e) {
                await bot.sendMessage(chatId, BotAnswer.invalidDataNews);

                console.error(e);
            }

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

//--------------------------------------------------------------------------------------------------------------------//

/**
 * Functions:
 */

function formArticlesPage() {
    let articlesText = ``;
    const buttons = [[]];

    const step = 10;
    const startIndex = inlinePageNumber * step;
    const endIndex = (articles.length - startIndex - step) < 0 ? articles.length : startIndex + step;
    const buttonsInRowAmount = 5;
    let indexOfCurrentRow = 0;

    for (let i = startIndex; i < endIndex; i++) {
        const article = articles[i];
        const localIndex = ((i % step) + 1); //Navigation markup index.

        //Forms HTML text:
        articlesText = articlesText.concat(`<b>${localIndex}:</b> ${article.name}`) + '\n';

        //Forms inline keyboard attached to message with list of articles:
        buttons[indexOfCurrentRow].push({text: localIndex, callback_data: article.queue});

        //Makes another row if amount of buttons in current row equals to buttonsInRowAmount variable:
        if (buttons[indexOfCurrentRow].length === buttonsInRowAmount) {
            buttons.push([]);

            indexOfCurrentRow++;
        }
    }

    const arrowButtons = formNavigationButtons();

    buttons.push(arrowButtons);

    return {text: articlesText, keyboard: buttons};
}

function formNavigationButtons() {
    const currentPage = inlinePageNumber + 1;
    const arrowButtons = [{text: '📄: ' + currentPage, callback_data: 0}];
    const lastArticlesPage = Math.ceil(articles.length / 10);

    if (currentPage !== 1) {
        arrowButtons.unshift({text: Button.arrowPrevious, callback_data: -1});
    }

    if (currentPage !== lastArticlesPage) {
        arrowButtons.push({text: Button.arrowNext, callback_data: 1});
    }

    return arrowButtons;
}

async function sendArticlesList(msg) {
    const chatId = msg.chat.id;
    const data = formArticlesPage();

    await bot.sendMessage(chatId, data.text, {
        parse_mode: 'HTML',
        reply_markup: {
            inline_keyboard: data.keyboard
        }
    });
}

async function updateLastInlineMessage(query) {
    const data = query.data;
    inlinePageNumber = inlinePageNumber + Number(data);

    const chatId = query.message.chat.id;
    const messageId = query.message.message_id;
    const articlesData = formArticlesPage();

    await bot.editMessageText(articlesData.text, {message_id: messageId, chat_id: chatId, parse_mode: 'HTML'});
    await bot.editMessageReplyMarkup({inline_keyboard: articlesData.keyboard},
        {message_id: messageId, chat_id: chatId});
}

async function fetchNewsFromWeb(requestText, dateFrom) {
    const articles = await news.v2.everything({
        q: requestText,
        sortBy: 'relevancy',
        from: dateFrom
    }).then(response => response.articles);

    return articles;
}

async function sendNews(chatId, articles, requestArticlesAmount) {
    const articlesAmount = articles.length < requestArticlesAmount ? articles.length : requestArticlesAmount;

    for (let i = 1; i <= articlesAmount; i++) {
        const article = articles[i];

        const source = article.source.name;
        const title = article.title;
        const lead = article.description;
        const date = dayjs(article.publishedAt).format('DD/MM/YYYY');
        const url = article.url;

        const html = `
<b>${i}:</b>
<i>Ресурс: ${source}</i>
<b>${title}</b>
${lead}
<i>${date}</i>
<b><a href="${url}">Посилання</a></b>
        `;

        await bot.sendMessage(chatId, html, {
            parse_mode: 'HTML'
        });
    }
}