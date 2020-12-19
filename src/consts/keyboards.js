const Button = require('./strings').Button;

exports.Keyboard = {
    main: [
        [Button.materials, Button.newsSearch],
    ],
    toMain: [
        [Button.toMain],
    ],
    anotherRequest: [
        [Button.anotherRequest],
        [Button.toMain],
    ],
    adminMenu: [
        [Button.clearUsers],
        [Button.toMain]
    ]
};