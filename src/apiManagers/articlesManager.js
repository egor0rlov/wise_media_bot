require('dotenv').config();

const fetch = require('node-fetch');
const {Button} = require('../consts/strings');

exports.ArticlesManager = class {
    constructor(bot) {
        this.bot = bot;
        this.inlinePageNumber = 0;
        this.nextPage = 1;
        this.prevPage = -1;
        this.pageNumber = 0;
        this.articlesHost = 'https://telegra.ph/';
    }

    async fetchArticles() {
        const response = await fetch(process.env.ARTICLES_URL);
        const body = await response.text();

        this.articles = JSON.parse(body);
    }

    _formArticlesPage() {
        let articlesText = ``;
        const buttons = [[]];

        const step = 10;
        const startIndex = this.inlinePageNumber * step;
        const endIndex = (this.articles.length - startIndex - step) < 0 ? this.articles.length : startIndex + step;

        const buttonsInRowAmount = 5;
        let indexOfCurrentRow = 0;

        for (let i = startIndex; i < endIndex; i++) {
            const article = this.articles[i];
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
        const currentPage = this.inlinePageNumber + 1;
        const arrowButtons = [{text: Button.page + ': ' + currentPage, callback_data: this.pageNumber}];
        const lastArticlesPage = Math.ceil(this.articles.length / 10);

        if (currentPage !== 1) {
            arrowButtons.unshift({text: Button.arrowPrevious, callback_data: this.prevPage});
        }

        if (currentPage !== lastArticlesPage) {
            arrowButtons.push({text: Button.arrowNext, callback_data: this.nextPage});
        }

        return arrowButtons;
    }

    async sendArticlesList(msg) {
        const chatId = msg.chat.id;
        const data = this._formArticlesPage();

        await this.bot.sendMessage(chatId, data.text, {
            parse_mode: 'HTML',
            reply_markup: {
                inline_keyboard: data.keyboard
            }
        });
    }

    async updateInlineMessage(query) {
        const data = query.data;
        this.inlinePageNumber = this.inlinePageNumber + Number(data);

        const chatId = query.message.chat.id;
        const messageId = query.message.message_id;
        const articlesData = this._formArticlesPage();

        await this.bot.editMessageText(articlesData.text, {message_id: messageId, chat_id: chatId, parse_mode: 'HTML'});
        await this.bot.editMessageReplyMarkup({inline_keyboard: articlesData.keyboard},
            {message_id: messageId, chat_id: chatId});
    }

    async sendArticleLink(query) {
        const data = query.data;
        const chatId = query.message.chat.id;
        const linkToSend = this.articlesHost + data;

        await this.bot.sendMessage(chatId, linkToSend);
    }
}