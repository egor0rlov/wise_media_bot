const requestString = {
    toMain: 'На головну 🌐',
    materials: 'Матеріали 🧾',
    newsSearch: 'Моніторинг новин 🔍',
    anotherRequest: 'Інший запит 🗳',
    arrowNext: '▶',
    arrowPrevious: '◀',
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
    toMain: requestString.toMain,
    materials: requestString.materials,
    newsSearch: requestString.newsSearch,
    anotherRequest: requestString.anotherRequest,
    arrowNext: requestString.arrowNext,
    arrowPrevious: requestString.arrowPrevious,
};

exports.RegEx = {
    start: new RegExp('/start'),
    toMain: new RegExp(requestString.toMain),
    materials: new RegExp(requestString.materials),
    newsSearch: new RegExp(requestString.newsSearch),
    anotherRequest: new RegExp(requestString.anotherRequest),
};

exports.SimpleString = {
    page: '📄',
    article: 'Стаття',
    resource: 'Ресурс',
    link: 'Посилання',
    fetchingArticles: 'Завантажую матеріали',
    pageWord: 'Сторінка',
    beginning: '↩',
    shuffle: '🔀',
    divisor: '➖',
}