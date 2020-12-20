const fetch = require('node-fetch');

const toSeconds = (m) => Math.floor(m / 1000);
const toMinutes = (m) => Math.floor(toSeconds(m) / 60);
const toHours = (m) => Math.floor(toMinutes(m) / 60);

exports.Time = {
    fromMilliseconds: {
        toSeconds: (mil) => toSeconds(mil),
        toMinutes: (mil) => toMinutes(mil),
        toHours: (mil) => toHours(mil),
    }
}

exports.fetchTelegraph = async function () {
    const getPagesUrl = `https://api.telegra.ph/getPageList?access_token=${process.env.TELEGRAPH_TOKEN}`;
    return fetch(getPagesUrl).then((res) => res.json()).then((parsed) => parsed);
}

exports.getChatId = function (msg) {
    return msg.chat.id;
}

exports.userIsAdmin = function (msg) {
    return msg.from.id === Number(process.env.ADMIN_TG_ID);
}

exports.drawDivisorLine = function (stringLength, divisor) {
    let result = '';

    for (let i = 0; i < stringLength; i++) {
        result += divisor;
    }

    return result;
}