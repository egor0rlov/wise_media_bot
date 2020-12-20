require('dotenv').config();

const {WiseMediaUserModel} = require('./mongoManager');
const WiseUser = WiseMediaUserModel;
const {Button, SimpleString} = require('../consts/strings');
const {articlesHost} = require('../consts/consts');
const {fetchTelegraph, drawThreeDivisors, drawDivisorLine} = require('../utils');

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
        await fetchTelegraph().then((response) => {
            const articles = response.result.pages
                .map((article) => {
                    return {
                        name: article.title,
                        path: article.path,
                        views: article.views,
                        url: article.url
                    };
                });

            this.articlesList = articles;
        });
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
            disable_web_page_preview: true,
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
                disable_web_page_preview: true,
                reply_markup: {inline_keyboard: articlesData.keyboard}
            });
        } catch (e) {
            if (!e.message.includes('exactly the same')) {
                console.error(e);
            }
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
        const step = 5; //Affects articles amount on page
        const startIndex = inlinePageNumber * step;
        const endIndex = (this.articlesList.length - startIndex - step) < 0 ? this.articlesList.length : startIndex + step;
        const buttonsInRowAmount = 5;
        let indexOfCurrentRow = 0;
        const copyOfArticles = [...this.articlesList];
        const maxLineLength = copyOfArticles.sort((a, b) => b.name.length - a.name.length)[0].name.length;

        for (let i = startIndex; i < endIndex; i++) {
            const article = this.articlesList[i];
            const articleNumeration = ((i % step) + 1); //From 1 to step.
            const articleLine = `<b>${articleNumeration}: <a href="${article.url}">${article.name}</a></b>
    ${SimpleString.views}: <b>${article.views}</b>\n\n`;

            articlesText += i > startIndex ? `${drawDivisorLine(maxLineLength / 2.7, SimpleString.divisor)}\n` : '';
            articlesText = articlesText.concat(articleLine);

            buttons[indexOfCurrentRow].push({text: articleNumeration, callback_data: article.path});

            if (buttons[indexOfCurrentRow].length === buttonsInRowAmount) {
                buttons.push([]);
                indexOfCurrentRow++;
            }
        }

        const arrowButtons = this._formNavigationButtons(inlinePageNumber, step);

        buttons.push(arrowButtons);

        return {text: articlesText, keyboard: buttons};
    }

    _formNavigationButtons(inlinePageNumber, step) {
        const currentPage = inlinePageNumber + 1;
        const arrowButtons = [
            {text: SimpleString.beginning, callback_data: this.firstPage},
            {text: SimpleString.shuffle, callback_data: this.randomPage},
        ];
        const lastArticlesPage = Math.ceil(this.articlesList.length / step);

        if (currentPage !== 1) {
            arrowButtons.unshift({text: Button.arrowPrevious, callback_data: this.prevPage});
        }

        if (currentPage !== lastArticlesPage) {
            arrowButtons.push({text: Button.arrowNext, callback_data: this.nextPage});
        }

        return arrowButtons;
    }
}