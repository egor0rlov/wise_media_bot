require('dotenv').config();

const fetch = require('node-fetch');
const {Button, SimpleString} = require('../consts/strings');
const {articlesHost} = require('../consts/consts');

exports.ArticlesManager = class {
    _bot;
    articlesList;
    _articlesHost;
    pageNumber;
    _inlinePageNumber;
    nextPage;
    prevPage;
    _lastListMessageId;
    _lastMaterialsRequestId;

    constructor(bot) {
        this._bot = bot;
        this.nextPage = '1';
        this.prevPage = '-1';
        this.pageNumber = '0';
        this._articlesHost = articlesHost;
    }

    async fetchArticles() {
        this._inlinePageNumber = 0;
        const response = await fetch(process.env.ARTICLES_URL);
        const body = await response.text();

        this.articlesList = JSON.parse(body);
    }

    async sendArticlesList(msg) {
        const chatId = msg.chat.id;
        const data = this._formArticlesPage();

        await this._deleteLastMaterialsRequest(chatId)
            .then(() => this._setLastMaterialsRequestId(msg));
        await this._deleteLastArticlesList(chatId);

        await this._bot.sendMessage(chatId, data.text, {
            parse_mode: 'HTML',
            reply_markup: {inline_keyboard: data.keyboard}
        })
            .then((sentMessage) => this._setLastArticlesListId(sentMessage));
    }

    async updateInlineMessage(query) {
        const data = query.data;
        this._inlinePageNumber = this._inlinePageNumber + Number(data);

        const chatId = query.message.chat.id;
        const messageId = query.message.message_id;
        const articlesData = this._formArticlesPage();

        await this._bot.editMessageText(articlesData.text, {message_id: messageId, chat_id: chatId, parse_mode: 'HTML'});
        await this._bot.editMessageReplyMarkup({inline_keyboard: articlesData.keyboard},
            {message_id: messageId, chat_id: chatId});
    }

    async sendArticleLink(query) {
        const data = query.data;
        const chatId = query.message.chat.id;
        const linkToSend = this._articlesHost + data;
        const messageText = `<b><a href="${linkToSend}">${SimpleString.article}: </a></b>`

        await this._bot.sendMessage(chatId, messageText, {parse_mode: 'HTML'});
    }

    _setLastMaterialsRequestId(message) {
        this._lastMaterialsRequestId = message.message_id;
    }

    async _deleteLastMaterialsRequest(chatId) {
        if (this._lastMaterialsRequestId) {
            await this._bot.deleteMessage(chatId, this._lastMaterialsRequestId);
        }
    }

    _setLastArticlesListId(message) {
        this._lastListMessageId = message.message_id;
    }

    async _deleteLastArticlesList(chatId) {
        if (this._lastListMessageId) {
            await this._bot.deleteMessage(chatId, this._lastListMessageId);
        }
    }

    _formArticlesPage() {
        let articlesText = ``;
        const buttons = [[]];

        const step = 10;
        const startIndex = this._inlinePageNumber * step;
        const endIndex = (this.articlesList.length - startIndex - step) < 0 ? this.articlesList.length : startIndex + step;

        const buttonsInRowAmount = 5;
        let indexOfCurrentRow = 0;

        for (let i = startIndex; i < endIndex; i++) {
            const article = this.articlesList[i];
            const articleNumeration = ((i % step) + 1); //From 1 to 10.

            articlesText = articlesText.concat(`<b>${articleNumeration}:</b> ${article.name}`) + '\n';

            buttons[indexOfCurrentRow].push({text: articleNumeration, callback_data: article.queue});

            if (buttons[indexOfCurrentRow].length === buttonsInRowAmount) {
                buttons.push([]);
                indexOfCurrentRow++;
            }
        }

        const arrowButtons = this._formNavigationButtons();

        buttons.push(arrowButtons);

        return {text: articlesText, keyboard: buttons};
    }

    _formNavigationButtons() {
        const currentPage = this._inlinePageNumber + 1;
        const arrowButtons = [{text: SimpleString.page + ': ' + currentPage, callback_data: this.pageNumber}];
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