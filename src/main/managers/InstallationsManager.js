const Config = require('../libs/Config');
const { cleanObject } = require('../util/Tools');
const { generateIdFor } = require('../util/Random');
const { removeVersion } = require('./VersionManager');


/* ============= INSTALLATIONS ============= */

const config = new Config({
    prefix: "InstallationsManager",
    color: "#0066d6",
    configName: "launcher-profiles.json",
    defaultConfig: Object.seal({
        tjmcVersion: '1.0.0',
        profiles: {},
    })
});

module.exports.load = (dir_path) => config.load(dir_path);
module.exports.addCallback = config.addCallback;
module.exports.removeCallback = config.removeCallback;

/**
 * Create new installation
 * @param {Object} options - Options for version
 * @param {Object} options.name - Name of the version
 * @param {Object} options.type - Type of the version
 * @param {Object} options.gameDir - Directory of the version
 * @param {Object} options.javaPath - Path to executable java file
 * @param {Object} options.javaArgs - Arguments for java machine
 * @param {Object} options.resolution - Resolution of the game window
 * @param {Object} options.resolution.width - Width of the game window
 * @param {Object} options.resolution.height - Height of the game window
 * @returns {String} - Hash of the created installation profile
 */
exports.createInstallation = async function (options = {}) {
    const current_date = new Date().toISOString();
    options = Object.assign({ // reassign
        created: current_date,
        icon: undefined,
        type: 'custom',
        gameDir: undefined,
        javaPath: undefined,
        javaArgs: undefined,
        lastUsed: undefined,
        lastVersionId: undefined,
        name: undefined,
        resolution: {
            width: undefined,
            height: undefined,
        },
        checkHash: true,
    }, options);
    const profile = cleanObject(options);

    const installations = config.getOption("profiles");
    if (profile) {
        const hash = generateIdFor(installations);
        Object.assign(installations, {
            [hash]: cleanObject(profile)
        });
        config.setOption("profiles", installations);
        return hash;
    }
    return undefined;
}

exports.getInstallations = async function () {
    return config.getOption("profiles");
}

/**
 * Returns the installation with the given hash
 * @param {*} hash - The hash of the installation
 * @returns {Object} - The installation's object
 */
exports.getInstallation = async function (hash) {
    return exports.getInstallationSync(hash);
}

/**
 * Returns the installation with the given hash (SYNC)
 * @param {*} hash - The hash of the installation
 * @returns {Object} - The installation's object
 */
exports.getInstallationSync = function (hash) {
    const installations = config.getOption("profiles");
    if (hash && Object(installations).hasOwnProperty(hash))
        return { hash: hash, ...installations[hash] };
    return undefined;
}

/**
 * Delete the installation with given hash
 * @param {String} hash - The hash of the installation
 * @param {Boolean} forceDeps - Should we delete all dependencies
 * @returns {Boolean} - Whether the deletion is success
 */
exports.removeInstallation = async function (hash, forceDeps = false) {
    const installations = config.getOption("profiles");
    if (hash && Object(installations).hasOwnProperty(hash)) {
        const installation = installations[hash];
        if (forceDeps) {
            await removeVersion(installation.lastVersionId);
        }
        delete installations[hash];
        config.setOption("profiles", installations);
        return hash;
    }
    return undefined;
}
