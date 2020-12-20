const mascot = '🧐';

const requestString = {
    toMain: 'На головну 🌐',
    materials: 'Матеріали 🧾',
    newsSearch: 'Моніторинг новин 🔍',
    anotherRequest: 'Інший запит 🗳',
    arrowNext: '▶',
    arrowPrevious: '◀',

    //Admin buttons strings:
    adminMenu: 'Меню адміна 🐌',
    clearUsers: 'Почистити базу даних ♻',
};

exports.BotAnswer = {
    whatDoYouWant: 'Що вас цікавить?' + mascot,
    enterRequest: 'Введіть запит 📝',
    invalidDataNews: 'Стаття містить невалідні дані. ❌',
    anythingElse: 'Щось ще?' + mascot,
    noNews: 'По цьому запиту немає новин ❌',
    isItSticker: 'А словами?' + mascot,
    welcomeAdmin: 'Давно не бачились ' + mascot,
    youAreNotAdmin: 'Ти не адмін ' + mascot,
    noUsersToDelete: 'Користувачів з перевищеним часом сесії немає ⚠',
    noUsers: 'Жодного користувача в базі ⚠',
    usersDeleted: (amount) => {
        const ending = amount === 1 ? 'користувача ✅' : 'користувачів ✅';
        return `Видалено ${amount} ` + ending;
    },
};

exports.Button = {
    toMain: requestString.toMain,
    materials: requestString.materials,
    newsSearch: requestString.newsSearch,
    anotherRequest: requestString.anotherRequest,
    arrowNext: requestString.arrowNext,
    arrowPrevious: requestString.arrowPrevious,
    adminMenu: requestString.adminMenu,
    clearUsers: requestString.clearUsers,
};

exports.RegEx = {
    start: new RegExp('/start'),
    toMain: new RegExp(requestString.toMain),
    materials: new RegExp(requestString.materials),
    newsSearch: new RegExp(requestString.newsSearch),
    anotherRequest: new RegExp(requestString.anotherRequest),
    adminMenu: new RegExp(requestString.adminMenu),
    clearUsers: new RegExp(requestString.clearUsers),
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
    views: '🔍 Переглядів',
}