require('dotenv').config();

const NewsAPI = require('newsapi');
const NEWS_TOKEN = process.env.NEWS_API_TOKEN;
const news = new NewsAPI(NEWS_TOKEN);
const dayjs = require('dayjs');
const {BotAnswer, SimpleString} = require('../consts/strings');

exports.NewsManager = class {
    constructor(bot) {
        this.bot = bot;
        this.pastWeek = dayjs().subtract(1, 'week').format('YYYY-MM-DD');
        this.requestArticlesAmount = 5;
    }

    async fetchNewsFromWeb(requestText) {
        const articles = await news.v2.everything({
            q: requestText,
            sortBy: 'relevancy',
            from: this.pastWeek
        }).then(response => response.articles);

        this.newsList = articles;
    }

    async sendNews(chatId) {
        const newsAmount = this.newsList.length < this.requestArticlesAmount ? this.newsList.length : this.requestArticlesAmount;

        for (let i = 0; i <= newsAmount - 1; i++) {
            const article = this.newsList[i];
            const html = this._getArticleInfoHtml(i, article);

            try {
                await this.bot.sendMessage(chatId, html, {parse_mode: 'HTML'});
            } catch (e) {
                await this.bot.sendMessage(chatId, BotAnswer.invalidDataNews);
            }
        }
    }

    _getArticleInfoHtml(articleIndex, article) {
        const source = article.source.name;
        const title = article.title;
        const lead = article.description;
        const date = dayjs(article.publishedAt).format('DD/MM/YYYY');
        const url = article.url;
        const html = `
<b>${articleIndex + 1}:</b>

<i>${SimpleString.resource}: ${source}</i>

<b>${title}</b>

${lead}

<i>${date}</i>

<b><a href="${url}">${SimpleString.link}</a></b>
        `;

        return html;
    }
}