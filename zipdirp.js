const zipdir = require("zip-dir");

function zipdirp(path, opts={}) {
    return new Promise((resolve, reject) => {
        zipdir(path, opts, function (err, buffer) {
            if (err) {
                reject(err);
            }
            resolve(buffer);
        });
    });
}

module.exports = zipdirp;
