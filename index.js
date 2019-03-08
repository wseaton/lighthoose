require('log-timestamp');

const path = require("path");

const fs = require("fs-extra");
const lighthouse = require("lighthouse");
const chromeLauncher = require("chrome-launcher");
const fetch = require("node-fetch");
const shell = require("shell-exec");

const config = require("./config.js");
const zipdirp = require("./zipdirp.js");

async function main() {
    console.log("requesting list of URLs to scan");
    const URLs = await fetchURLs();

    console.log(`received URLs: ${URLs.join(' ')}`);
    console.log(`beginning scans`);

    const dateCmd = await shell("date +%Y-%m-%d_%H:%M:%S");
    const date = dateCmd.stdout.trim().replace(/[^A-z0-9]/g,'_');

    // start all scans in parallel and wait for them to finish
    let scanId = 0;
    await Promise.all(URLs.map(url => lighthoose(url, date, ++scanId, config)));

    console.log(`all scans complete`);
    console.log(`compressing reports`);

    await compressReports();

    console.log(`reports compressed`);
}

async function fetchURLs() {
    const rsp = await fetch(config.docURL);
    const text = await rsp.text();

    return text.split(/\s+/);
}


// The shell version
async function lighthoose(url, date, scanId, config, opts = { chromeFlags: ["--headless", "--no-sandbox"] }) {

    console.log(`scan ${scanId} starting on ${url}`);

    const happyUrl = url.replace(/[^A-z0-9]/g,'_');
    const outputDir = path.resolve(config.saveReportPath, happyUrl, date);
    const outputPath = path.resolve(outputDir, "lighthoose");

    // create reports dir
    await fs.ensureDir(outputDir);

    const cmd = [`./node_modules/.bin/lighthouse`,
        `--chrome-flags="${opts.chromeFlags.join(" ")}"`,
        `--no-sandbox`,
        `--output=json`,
        `--output=html`,
        `--output=csv`,
        `--output-path=${outputPath}`,
        `"${url}"`].join(" ");

    try {
        const cmdOut = await shell(cmd);
    } catch (e) {
        console.log(`could not run lighthouse`);
        throw e;
    }

    console.log(`scan ${scanId} complete, report saved in ${outputDir}`);
}

async function compressReports() {
    const reportPath = path.join(__dirname, config.saveReportPath);
    await zipdirp(
        reportPath,
        {
            saveTo: path.join(reportPath, 'lighthoose-reports-all.zip'),
            filter: path => !/\.zip$/.test(path) // don't include existing zip files
        }
    );
}

main();
