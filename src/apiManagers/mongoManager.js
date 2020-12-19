const dbConnectionUri = process.env.MONGO_URI;
const mongoose = require('mongoose');
const {Time} = require("../utils");
const Schema = mongoose.Schema;
const WiseMediaUserSchema = new Schema({
    tgChatId: Number,
    tgId: Number,
    tgName: String,
    inlinePageNumber: Number,
    lastListMessageId: Number,
    lastMaterialsRequestId: Number,
    dateAdded: Date
});

connectToDb(dbConnectionUri);

exports.WiseMediaUserModel = mongoose.model('WiseMediaUser', WiseMediaUserSchema);

exports.setZeroPageOrAddUser = async function (WiseUser, message) {
    const userId = message.from.id;

    await WiseUser.findOne({tgId: userId}).exec((err, res) => {
        if (err) console.log(err)

        if (!res) {
            WiseUser.create({
                tgChatId: message.chat.id,
                tgId: userId,
                tgName: message.from.username,
                inlinePageNumber: 0,
                lastListMessageId: null,
                lastMaterialsRequestId: null,
                dateAdded: Date.now()
            }, (err) => {
                if (err) console.log(err);
            });
        }
    });
}

exports.runDatabaseCleaner = async function (WiseUser, bot) {
    const sessionDurationHours = 1;
    const sessionDurationMilliseconds = Time.fromHoursToMilliseconds(sessionDurationHours);

    setInterval(async () => {
        WiseUser.find({}).exec((error, response) => {
            if (error) console.log(error);
            if (response.length) {
                const users = response;
                const userIdsToDelete = [];

                users.forEach((user) => {
                    const differenceWithNow = Date.now() - new Date(user.dateAdded);
                    const differenceInHours = Time.fromMillisecondsToHours(differenceWithNow);

                    if (differenceInHours >= sessionDurationHours) {
                        deleteMaterials(user, bot);
                        userIdsToDelete.push(user._id);
                    }
                });

                deleteUsersIfPresent(userIdsToDelete, WiseUser);
            }
        });
    }, sessionDurationMilliseconds);
}

async function deleteMaterials(user, bot) {
    const chatId = user.tgChatId;
    const lastMaterialsRequestId = user.lastMaterialsRequestId;
    const lastListMessageId = user.lastListMessageId;

    if (lastMaterialsRequestId && lastListMessageId) {
        await bot.deleteMessage(chatId, lastMaterialsRequestId);
        await bot.deleteMessage(chatId, lastListMessageId);
    }
}

async function deleteUsersIfPresent(idsToDelete, WiseUser) {
    if (idsToDelete.length) {
        WiseUser.deleteMany({_id: {$in: idsToDelete}}, (err, response) => {
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