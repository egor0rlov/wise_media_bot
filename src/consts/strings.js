const requestStrings = {
    toMain: 'На головну 🌐',
    materials: 'Матеріали 🧾',
    newsSearch: 'Моніторинг новин 🔍',
    anotherRequest: 'Інший запит 🗳',
    arrowNext: '▶',
    arrowPrevious: '◀',
    page: '📄',
};

exports.BotAnswer = {
    whatDoYouWant: 'Що вас цікавить? 🧐',
    enterRequest: 'Введіть запит 📝',
    invalidDataNews: 'Стаття містить невалідні дані. ❌',
    anythingElse: 'Щось ще? 🧐',
    noNews: 'По цьому запиту немає новин ❌',
    isItSticker: 'А словами? 🧐',
};

exports.Button = {
    toMain: requestStrings.toMain,
    materials: requestStrings.materials,
    newsSearch: requestStrings.newsSearch,
    anotherRequest: requestStrings.anotherRequest,
    arrowNext: requestStrings.arrowNext,
    arrowPrevious: requestStrings.arrowPrevious,
    page: requestStrings.page,
};

exports.RegEx = {
    start: new RegExp('/start'),
    toMain: new RegExp(requestStrings.toMain),
    materials: new RegExp(requestStrings.materials),
    newsSearch: new RegExp(requestStrings.newsSearch),
    anotherRequest: new RegExp(requestStrings.anotherRequest),
};