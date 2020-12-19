const dbConnectionUri = process.env.MONGO_URI;
const mongoose = require('mongoose');
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
exports.clearPageNumberOrAddUser = async function (WiseUser, message) {
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
exports.databaseCleaner = async function (WiseUser) {
    const sessionDurationHours = 2;
    const sessionDurationMilliseconds = sessionDurationHours * 60 * 60 * 1000;

    setInterval(async () => {
        const hoursFromNow = new Date().getHours() - sessionDurationHours;
        const inMilliseconds = new Date().setHours(hoursFromNow);

        WiseUser.find({}).where('dateAdded').lte(inMilliseconds).exec((error, response) => {
            if (error) console.log(error);
            if (response.length) {
                const idsToDelete = response.map((record) => record.id);

                WiseUser.deleteMany({_id: {$in: idsToDelete}}, (err, response) => {
                    if (err) console.error(err);
                });
            }
        });
    }, sessionDurationMilliseconds);
}

async function connectToDb(dbConnectionUri) {
    await mongoose.connect(dbConnectionUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
        useCreateIndex: true
    });
}