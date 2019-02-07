require('log-timestamp');

const path = require("path");

const fs = require("fs-extra");
const lighthouse = require("lighthouse");
const chromeLauncher = require("chrome-launcher");
const fetch = require("node-fetch");
const shell = require("shell-exec");

const config = require("./config.js");

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
}

async function fetchURLs() {
    const rsp = await fetch(config.docURL);
    const text = await rsp.text();

    return text.split(/\s+/);
}


// The shell version
async function lighthoose(url, date, scanId, config, opts = { chromeFlags: ["--headless"] }) {

    console.log(`scan ${scanId} starting on ${url}`);

    const happyUrl = url.replace(/[^A-z0-9]/g,'_');
    const outputDir = path.join(config.saveReportPath, happyUrl, date);
    const outputPath = path.join(outputDir, "lighthoose");

    // create reports dir
    await fs.ensureDir(outputDir);

    const cmd = [`./node_modules/.bin/lighthouse`,
        `--chrome-flags="${opts.chromeFlags.join(" ")}"`,
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

main();
