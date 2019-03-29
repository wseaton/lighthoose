require("log-timestamp");

const path = require("path");

const _ = require("lodash");
const fs = require("fs-extra");
const lighthouse = require("lighthouse");
const chromeLauncher = require("chrome-launcher");
const fetch = require("node-fetch");
const shell = require("shell-exec");
const globby = require("globby");

const config = require("./config.js");
const zipdirp = require("./zipdirp.js");

async function scan() {
  // console.log("starting lighthoose scan");
  // const URLs = await fetchURLs();

  // console.log(`received URLs: ${URLs.join(' ')}`);
  // console.log(`beginning scans`);

  // const dateCmd = await shell("date +%Y-%m-%d_%H:%M:%S");
  // const date = dateCmd.stdout.trim().replace(/[^A-z0-9]/g,'_');

  // for (let url of URLs) {
  //     await lighthoose(url, date, config);
  // }

  // console.log(`all scans complete`);
  // console.log(`compressing reports`);

  await combineJSON();
  // await compressReports();

  console.log(`reports compressed`);
}

async function fetchURLs() {
  const docURL = config.docURL;
  console.log(`requesting list of URLs to scan from ${docURL}`);
  const rsp = await fetch(docURL);
  const text = await rsp.text();

  return text.split(/\s+/);
}

// The shell version
async function lighthoose(
  url,
  date,
  config,
  opts = { chromeFlags: ["--headless", "--no-sandbox"] }
) {
  console.log(`scan starting on ${url}`);

  const happyUrl = url.replace(/[^A-z0-9]/g, "_");
  const outputDir = path.resolve(config.saveReportPath, happyUrl, date);
  const outputPath = path.resolve(outputDir, "lighthoose");

  // create reports dir
  await fs.ensureDir(outputDir);

  const onOpenshift = !!process.env.OPENSHIFT_BUILD_NAME;
  const openshiftCpuSlowdownMultiplier = 1;

  if (onOpenshift) {
    console.log(
      `detected openshift environment, setting CPU slowdown factor to ${1 /
        openshiftCpuSlowdownMultiplier}`
    );
  }

  const cmd = [
    `./node_modules/.bin/lighthouse`,
    `--chrome-flags="${opts.chromeFlags.join(" ")}"`,
    `--no-sandbox`,
    onOpenshift
      ? `--throttling.cpuSlowdownMultiplier=${openshiftCpuSlowdownMultiplier}`
      : "",
    `--output=json`,
    `--output=html`,
    `--output=csv`,
    `--output-path=${outputPath}`,
    `"${url}"`
  ].join(" ");

  try {
    const cmdOut = await shell(cmd);
  } catch (e) {
    console.log(`could not run lighthouse`);
    throw e;
  }

  console.log(`scan ${scanId} complete, report saved in ${outputDir}`);
}

async function combineJSON() {
  const reportPath = path.resolve(__dirname, config.saveReportPath);

  // properties of lighthouse JSON that we want to surface to the UI
  const INCLUDED_PROPS = [
    "audits.first-contentful-paint",
    "audits.first-meaningful-paint",
    "audits.speed-index"
  ];

  // properties of the lighthouse JSON that we don't want to surface to the
  // UI  (essentially, sub-properties of INCLUDED_PROPS that we want to omit)
  const EXCLUDED_SUB_PROPS = _.flatten(
    ["displayValue", "id", "description", "scoreDisplayMode", "title"].map(sp =>
      INCLUDED_PROPS.map(ip => `${ip}.${sp}`)
    )
  );

  const jsonFiles = await globby(
    path.join(reportPath, "**", "lighthoose.report.json")
  );

  const combinedJSON = jsonFiles.map(require);

  // pick only the properties we care about for the UI
  const data = _(combinedJSON)
    .map(o =>
      _(o)
        .pick(INCLUDED_PROPS)
        .omit(EXCLUDED_SUB_PROPS)
        .value()
    )
    .value();

  // grab a copy of a few properties that were previously duplicated, for lookup in the UI
  const legend = _.pick(
    _.first(combinedJSON),
    _.flatten(INCLUDED_PROPS.map(ip => [`${ip}.description`, `${ip}.title`]))
  );

  await fs.writeJson(path.join(reportPath, "lighthoose.history.json"), {
    data,
    legend
  });
}

async function compressReports() {
  const reportPath = path.resolve(__dirname, config.saveReportPath);
  await zipdirp(reportPath, {
    saveTo: path.join(reportPath, "lighthoose-reports-all.zip"),
    filter: path => !/\.zip$/.test(path) // don't include existing zip files
  });
}

module.exports = scan;

if (require.main === module) {
  scan();
}
