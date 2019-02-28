const config = {
    docURL: process.env.SHEET_URL,
    saveReportPath: process.env.REPORT_DIR || "reports" // relative to lighthoose's root
}

if (!config.docURL) {
    throw new Error("the SHEET_URL environment variable must be set");
}

module.exports = config;
