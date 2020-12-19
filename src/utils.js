const fetch = require('node-fetch');

exports.Time = {
    fromMilliseconds: {
        toSeconds: (milliseconds) => {
            return Math.floor(milliseconds / 1000);
        },
        toMinutes: (milliseconds) => {
            return Math.floor(milliseconds / 1000 / 60);
        },
        toHours: (milliseconds) => {
            return Math.floor(milliseconds / 1000 / 60 / 60);
        },
    }
}

exports.fetchTelegraph = async function () {
    const getPagesUrl = `https://api.telegra.ph/getPageList?access_token=${process.env.TELEGRAPH_TOKEN}`;

    return fetch(getPagesUrl)
        .then(res => res.json())
        .then(json => {
            return json;
        });
}

exports.getChatId = function (msg) {
    return msg.chat.id;
}

exports.userIsAdmin = function (msg) {
    return msg.from.id === Number(process.env.ADMIN_TG_ID);
}