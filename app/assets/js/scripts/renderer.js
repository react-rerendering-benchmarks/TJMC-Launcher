import { SidebarMain, MainContainer, user_panel } from '../panel.js'
import { Layer } from './Layer.js';
import { Settings } from '../settings.js';
/* ================================= */

const sidebar_el = new SidebarMain();
const main_container = MainContainer();
const main_layer = new Layer({ label: 'main-layer' });
main_layer.append(main_container);
main_layer.join();

/* --------------------------------- */
const plb = qsl('#playButton')
const topBar = qsl('#topBar')
const progressBar = qsl('#progress-bar')
/* ================================= */

console.debug('Renderer init')

const VIEWS = {
    landing: main_layer.content
}

export var currentView
var currentVersion
var Installations

/**
 * Switch launcher views.
 * 
 * @param {String} next (requied) The ID of the next view container
 * @param {Number} currentFadeTime The fade out time for the current view
 * @param {Number} nextFadeTime The fade in time for the next view
 * @param {Function} onCurrentFade Callback function to execute when the current
 * view fades out.
 * @param {Function} onNextFade Callback function to execute when the next view
 * fades in.
 */
export function switchView(next, currentFadeTime = 100, nextFadeTime = 100, onCurrentFade = () => {}, onNextFade = () => {}){
    let current = currentView
    currentView = next
    if (current) current.fadeOut(currentFadeTime, () => onCurrentFade())
    if (next) next.fadeIn(nextFadeTime, () => onNextFade())
}

/**
 * Creates new settings layer
 */
function openSettings() {
    new Settings()
}

plb.addEventListener('click', (e) => startMine(currentVersion))

async function startMine(version_hash = null) {
    console.log(`Starting minecraft with hash: ${version_hash}`);
    topBar.toggle(true);
    await electron.invoke('launch-mine', version_hash);
    topBar.toggle(false);
}

async function getConfig() {
    return await electron.invoke('configuration.get');
}
async function setConfig(config) {
    return await electron.invoke('configuration.set', config);
}
async function getMem() {
    return await electron.invoke('system.mem');
}

getConfig().then(config => {
    qsl('.sidebar-main').appendChild(user_panel(config.auth))
})

window.onload = function(e) {
    const preloader = qsl('#preloader')
    switchView(VIEWS.landing, 100, 100)
    setTimeout(() => {
        preloader.fadeOut(500, () => {
            preloader.remove()
            document.documentElement.classList.remove('preload')
        })
    }, 1000)
}

async function refreshVersions() {
    Installations = await electron.invoke('installations.get');
    const installations_entries = Object.entries(Installations);
    sidebar_el.removeAll();
    if (installations_entries.length > 0) {
        for (const [hash, params] of installations_entries) {
            sidebar_el.addItem({ hash: hash, ...params }, (item) => {
                selectVersion(item.hash);
            });
        }
    } else {
        sidebar_el.createFirstPage();
    }
    qsl('.localVersions').append(sidebar_el.content());

    if (localStorage.version_hash && Object(Installations).hasOwnProperty(localStorage.version_hash)) { renderSelectVersion(localStorage.version_hash) }
    else if (installations_entries[0] && installations_entries[0][0]) { selectVersion(installations_entries[0][0]) }
    else false
};
refreshVersions();

function selectVersion(version_hash) {
    if (!version_hash) return false;
    localStorage.version_hash = version_hash;
    renderSelectVersion(version_hash);
}

async function renderSelectVersion(version_hash = null) {
    if (!version_hash || version_hash == null || typeof version_hash !== 'string') return false;
    currentVersion = version_hash
    console.debug(currentVersion)
    const version = await getInstallation(version_hash);
    let m = qsl('.top-toolbar'),
        n = m.qsl('h2'),
        d = m.qsl('h5');
    sidebar_el.selectVersion(version_hash);
    n.innerText = version.name || version.hash
    d.innerText = version.type
}

async function getInstallation(version_hash) {
    if (Installations && Object(Installations).hasOwnProperty(version_hash)) {
        return { hash: version_hash, ...Installations[version_hash] } || null;
    }
}

async function registerElectronEvents() {
    electron.on('open-settings', (e) => openSettings());
    electron.on('startup-error', (e, error) => {
        modal.alert('Ошибка при запуске', error, 'error', {
            logType: true
        });
    });
    electron.on('error', (e, error) => {
        console.error(error);
        modal.alert('Ошибка', error, 'error', {
            logType: true
        });
    });
    electron.on('progress', (e, progress) => progressBar.setValue(progress * 100))
    progressBar.setValue = (v) => progressBar.style.width = v + "%"
}
registerElectronEvents();