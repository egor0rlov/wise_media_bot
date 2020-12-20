const dbConnectionUri = process.env.MONGO_URI;
const mongoose = require('mongoose');
const {Time, getChatId} = require("../utils");
const {BotAnswer} = require('../consts/strings');
const Schema = mongoose.Schema;
const WiseMediaUserSchema = new Schema({
    tgChatId: Number,
    tgId: Number,
    tgName: String,
    inlinePageNumber: Number,
    lastListMessageId: Number,
    lastMaterialsRequestId: Number,
    dateAdded: Date,
    botState: Number
});

connectToDb(dbConnectionUri);

//Export:
exports.WiseMediaUserModel = mongoose.model('WiseMediaUser', WiseMediaUserSchema);

exports.addUserIfNotInDb = function (WiseUser, msg) {
    const userId = msg.from.id;

    WiseUser.findOne({tgId: userId}).exec((err, res) => {
        if (err) console.log(err)

        if (!res) {
            WiseUser.create({
                tgChatId: msg.chat.id,
                tgId: userId,
                tgName: msg.from.username,
                inlinePageNumber: 0,
                lastListMessageId: null,
                lastMaterialsRequestId: null,
                dateAdded: Date.now(),
                botState: 0
            }, (err) => {
                if (err) console.log(err);
            });
        }
    });
};

exports.cleanDatabase = async function (WiseUser, bot, msg) {
    const sessionDurationMinutes = 45;

    WiseUser.find({}).exec((error, response) => {
        if (error) console.log(error);
        if (response.length) {
            const users = response;
            const userIdsToDelete = [];

            users.forEach((user) => {
                const differenceWithNow = Date.now() - new Date(user.dateAdded);
                const differenceInHours = Time.fromMilliseconds.toMinutes(differenceWithNow);

                if (differenceInHours >= sessionDurationMinutes) {
                    deleteMaterialsMessages(user, bot);
                    userIdsToDelete.push(user._id);
                }
            });

            if (userIdsToDelete.length > 0) {
                deleteUsersIfPresent(userIdsToDelete, WiseUser);
                bot.sendMessage(getChatId(msg), BotAnswer.usersDeleted(userIdsToDelete.length));
            } else if (userIdsToDelete.length === 0) {
                bot.sendMessage(getChatId(msg), BotAnswer.noUsersToDelete);
            }
        } else {
            bot.sendMessage(getChatId(msg), BotAnswer.noUsers);
        }
    });
};

exports.getUserBy = async function (WiseUser, filter) {
    return await WiseUser.findOne(filter);
};

exports.updateUserBy = async function (WiseUser, filter, update) {
    WiseUser.updateOne(filter, update, {}, (err) => {
        if (err) console.log(err);
    });
};

//Local:
async function deleteMaterialsMessages(user, bot) {
    const chatId = user.tgChatId;
    const lastMaterialsRequestId = user.lastMaterialsRequestId;
    const lastListMessageId = user.lastListMessageId;

    if (lastMaterialsRequestId && lastListMessageId) {
        await bot.deleteMessage(chatId, lastMaterialsRequestId);
        await bot.deleteMessage(chatId, lastListMessageId);
    }
}

function deleteUsersIfPresent(idsToDelete, WiseUser) {
    if (idsToDelete.length) {
        WiseUser.deleteMany({_id: {$in: idsToDelete}}, (err) => {
            if (err) console.error(err);
        });
    }
}

async function connectToDb(dbConnectionUri) {
    await mongoose.connect(dbConnectionUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
        useCreateIndex: true
    });
}