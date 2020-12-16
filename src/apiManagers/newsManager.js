require('dotenv').config();

const NewsAPI = require('newsapi');
const NEWS_TOKEN = process.env.NEWS_API_TOKEN;
const news = new NewsAPI(NEWS_TOKEN);
const dayjs = require('dayjs');
const {BotAnswer} = require('../consts/strings');

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

        this.news = articles;
    }

    async sendNews(chatId) {
        const newsAmount = this.news.length < this.requestArticlesAmount ? this.news.length : this.requestArticlesAmount;

        for (let i = 0; i <= newsAmount - 1; i++) {
            const article = this.news[i];

            const source = article.source.name;
            const title = article.title;
            const lead = article.description;
            const date = dayjs(article.publishedAt).format('DD/MM/YYYY');
            const url = article.url;

            const html = this._getArticleInfoHtml(i, source, title, lead, date, url);

            try {
                await this.bot.sendMessage(chatId, html, {
                    parse_mode: 'HTML'
                });
            } catch (e) {
                await this.bot.sendMessage(chatId, BotAnswer.invalidDataNews);

                console.error(e);
            }
        }
    }

    _getArticleInfoHtml(articleIndex, source, title, lead, date, url) {
        const html = `
<b>${articleIndex + 1}:</b>

<i>Ресурс: ${source}</i>

<b>${title}</b>

${lead}

<i>${date}</i>

<b><a href="${url}">Посилання</a></b>
        `;

        return html;
    }
}