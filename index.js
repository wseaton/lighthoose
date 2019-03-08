require('log-timestamp');

const cron = require("node-cron");
const scan = require("./scan.js");

cron.schedule('0 1 * * *', scan, { timezone: "America/New_York" });
