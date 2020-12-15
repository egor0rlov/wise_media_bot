const fetch = require('node-fetch');

exports.fetchMyArticles = async function () {
    const response = await fetch(process.env.ARTICLES_URL);
    const body = await response.text();

    return JSON.parse(body);
}