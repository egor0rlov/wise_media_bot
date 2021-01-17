const fetch = require('node-fetch');
const { Button, BotAnswer } = require('./consts/strings');

const toSeconds = (m) => Math.floor(m / 1000);
const toMinutes = (m) => Math.floor(toSeconds(m) / 60);
const toHours = (m) => Math.floor(toMinutes(m) / 60);

exports.Time = {
    fromMilliseconds: {
        toSeconds: (mil) => toSeconds(mil),
        toMinutes: (mil) => toMinutes(mil),
        toHours: (mil) => toHours(mil),
    }
};

exports.fetchTelegraph = async function () {
    const getPagesUrl = `https://api.telegra.ph/getPageList?access_token=${process.env.TELEGRAPH_TOKEN}`;
    return fetch(getPagesUrl).then((res) => res.json()).then((parsed) => parsed);
};

exports.getChatId = function (msg) {
    return msg.chat.id;
};

exports.userIsAdmin = function (msg) {
    return msg.from.id === Number(process.env.ADMIN_TG_ID);
};

exports.drawMiddleDivisor = function (stringLength, divisor, space = '  ') {
    const end = stringLength - 1;
    const middle = stringLength % 2 === 0 ? [Math.floor(end / 2), Math.ceil(end / 2)] : [Math.floor(end / 2)];
    const isOneOf = (value, ...values) => Boolean(values.filter((elem) => elem === value).length);
    let result = '';

    for (let i = 0; i < stringLength; i++) {
        if (isOneOf(i, ...middle)) {
            result += divisor;
        } else {
            result += space;
        }
    }

    return result;
};

exports.textIsNotCommand = function (text) {
    return !Object.values(Button).includes(text) && !Object.values(BotAnswer).includes(text)
};