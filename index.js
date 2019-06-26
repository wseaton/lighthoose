require('log-timestamp');

const cron = require("node-cron");
const scan = require("./scan.js");

cron.schedule('0 0 30 2 *', scan, { timezone: "America/New_York" });
