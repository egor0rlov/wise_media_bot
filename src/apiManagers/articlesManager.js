require('dotenv').config();

const {WiseMediaUserModel} = require('./mongoManager');
const WiseUser = WiseMediaUserModel;
const fetch = require('node-fetch');
const {Button, SimpleString} = require('../consts/strings');
const {articlesHost} = require('../consts/consts');

exports.ArticlesManager = class {
    _bot;
    articlesList;
    _articlesHost;
    firstPage;
    randomPage;
    nextPage;
    prevPage;

    constructor(bot) {
        this._bot = bot;
        this.nextPage = '1';
        this.prevPage = '-1';
        this.firstPage = '0';
        this.randomPage = '-777';
        this._articlesHost = articlesHost;

        this.fetchArticles();
    }

    async fetchArticles() {
        const response = await fetch(process.env.ARTICLES_URL);
        const body = await response.text();

        this.articlesList = JSON.parse(body);
    }

    async sendArticlesList(msg) {
        const userId = msg.from.id;
        const chatId = msg.chat.id;
        const userData = await WiseUser.findOne({tgId: userId});
        const data = this._formArticlesPage(userData.inlinePageNumber);

        await this._deleteMessageIfPresent(chatId, userData.lastMaterialsRequestId)
        await this._deleteMessageIfPresent(chatId, userData.lastListMessageId);

        await this._bot.sendMessage(chatId, data.text, {
            parse_mode: 'HTML',
            reply_markup: {inline_keyboard: data.keyboard}
        })
            .then((res) => {
                WiseUser.updateOne({tgId: userId}, {
                    lastListMessageId: res.message_id,
                    lastMaterialsRequestId: msg.message_id
                }, {}, (err, res) => {
                    if (err) console.log(err);
                });
            });
    }

    async updateInlineMessage(query, directPage = -1) {
        const data = query.data;
        const chatId = query.message.chat.id;
        const messageId = query.message.message_id;
        const userId = query.from.id;
        const userData = await WiseUser.findOne({tgId: userId});
        const changedPageNumber = directPage !== -1 ? directPage : userData.inlinePageNumber + Number(data);
        const articlesData = this._formArticlesPage(changedPageNumber);

        await WiseUser.updateOne({tgId: userId}, {inlinePageNumber: changedPageNumber});

        try {
            await this._bot.editMessageText(articlesData.text, {
                message_id: messageId,
                chat_id: chatId,
                parse_mode: 'HTML',
                reply_markup: {inline_keyboard: articlesData.keyboard}
            });
        } catch (e) {
            console.error(e);
        } finally {
            await this._bot.answerCallbackQuery(query.id);
        }
    }

    async sendArticleLink(query) {
        const chatId = query.message.chat.id;
        const linkToSend = this._articlesHost + query.data;
        const messageText = `<b><a href="${linkToSend}">${SimpleString.article}: </a></b>`

        await this._bot.sendMessage(chatId, messageText, {parse_mode: 'HTML'});
        await this._bot.answerCallbackQuery(query.id);
    }

    async _deleteMessageIfPresent(chatId, messageId) {
        if (messageId) {
            await this._bot.deleteMessage(chatId, messageId);
        }
    }

    _formArticlesPage(inlinePageNumber) {
        let articlesText = `<b>${SimpleString.page + ' ' + SimpleString.pageWord + ' ' + (inlinePageNumber + 1)}</b>\n\n`;
        const buttons = [[]];
        const step = 10;
        const startIndex = inlinePageNumber * step;
        const endIndex = (this.articlesList.length - startIndex - step) < 0 ? this.articlesList.length : startIndex + step;
        const buttonsInRowAmount = 5;
        let indexOfCurrentRow = 0;

        for (let i = startIndex; i < endIndex; i++) {
            const article = this.articlesList[i];
            const articleNumeration = ((i % step) + 1); //From 1 to 10.
            const articleLine = `<b>${articleNumeration}:</b> ${article.name}`;

            articlesText = articlesText.concat(articleLine);
            articlesText += `\n${SimpleString.divisor}\n`;

            buttons[indexOfCurrentRow].push({text: articleNumeration, callback_data: article.queue});

            if (buttons[indexOfCurrentRow].length === buttonsInRowAmount) {
                buttons.push([]);
                indexOfCurrentRow++;
            }
        }

        const arrowButtons = this._formNavigationButtons(inlinePageNumber);

        buttons.push(arrowButtons);

        return {text: articlesText, keyboard: buttons};
    }

    _formNavigationButtons(inlinePageNumber) {
        const currentPage = inlinePageNumber + 1;
        const arrowButtons = [
            {text: SimpleString.beginning, callback_data: this.firstPage},
            {text: SimpleString.shuffle, callback_data: this.randomPage},
        ];
        const lastArticlesPage = Math.ceil(this.articlesList.length / 10);

        if (currentPage !== 1) {
            arrowButtons.unshift({text: Button.arrowPrevious, callback_data: this.prevPage});
        }

        if (currentPage !== lastArticlesPage) {
            arrowButtons.push({text: Button.arrowNext, callback_data: this.nextPage});
        }

        return arrowButtons;
    }
}