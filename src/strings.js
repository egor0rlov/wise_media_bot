/**
 * Command messages from user:
 */

const requestStrings = {
    toMain: 'На головну 🌐',
    materials: 'Матеріали 🧾',
    newsSearch: 'Моніторинг новин 🔍',
    anotherRequest: 'Інший запит 🗳',
    arrowNext: '▶',
    arrowPrevious: '◀',
};

/**
 * Bot's responses:
 */

exports.BotAnswer = {
    whatDoYouWant: 'Що вас цікавить? 🧐',
    enterRequest: 'Введіть запит 📝',
    invalidDataNews: 'Якась із статей містить невалідні дані. ❌',
    anythingElse: 'Щось ще? 🧐',
    noNews: 'По цьому запиту немає новин ❌',
    isItSticker: 'А словами? 🧐',
};

/**
 * Buttons using command strings:
 */

exports.Button = {
    toMain: requestStrings.toMain,
    materials: requestStrings.materials,
    newsSearch: requestStrings.newsSearch,
    anotherRequest: requestStrings.anotherRequest,
    arrowNext: requestStrings.arrowNext,
    arrowPrevious: requestStrings.arrowPrevious,
};

/**
 * Regular expressions using command strings:
 */

exports.RegEx = {
    start: new RegExp('/start'),
    toMain: new RegExp(requestStrings.toMain),
    materials: new RegExp(requestStrings.materials),
    newsSearch: new RegExp(requestStrings.newsSearch),
    anotherRequest: new RegExp(requestStrings.anotherRequest),
};