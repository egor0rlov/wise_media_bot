exports.Time = {
    fromMillisecondsToHours: (milliseconds) => {
        return Math.floor(milliseconds / 1000 / 60 / 60);
    },
    fromHoursToMilliseconds: (hours) => {
        return hours * 60 * 60 * 1000;
    },
}