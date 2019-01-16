const lighthouse = require("lighthouse");
const chromeLauncher = require("chrome-launcher");
const fetch = require("node-fetch");
const config = require("./config.js");

async function main() {
    const URLs = await fetchURLs();

    console.log(URLs);

    if (URLs && URLs[0]) {
    }

    const results = await lighthoose("https://clayto.com");

    console.log(JSON.stringify(results, null, 2));
}

async function fetchURLs() {
    const rsp = await fetch(config.docURL);
    const text = await rsp.text();

    return text.split(/\s+/);
}

function lighthoose(url, opts = { chromeFlags: ["--headless"] }, config = null) {
  return chromeLauncher.launch({chromeFlags: opts.chromeFlags}).then(chrome => {
    opts.port = chrome.port;
    return lighthouse(url, opts, config).then(results => {
      // use results.lhr for the JS-consumeable output
      // https://github.com/GoogleChrome/lighthouse/blob/master/types/lhr.d.ts
      // use results.report for the HTML/JSON/CSV output as a string
      // use results.artifacts for the trace/screenshots/other specific case you need (rarer)
      return chrome.kill().then(() => results.lhr)
    });
  });
}


main();
