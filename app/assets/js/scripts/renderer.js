
import { Layer } from './Layer.js';
import { Settings } from '../settings.js';
import { VIEWS, switchView } from './LayerSwitcher.js';
import { startMinecraft } from './Tools.js';
import { getCurrentVersionHash, MainContainer } from '../ui/sidebar-main.js';
import { modal } from './AlertEx.js';

/* ================================= */

const main_layer = new Layer({ label: 'main-layer' });
export const mainContainer = new MainContainer();
main_layer.append(mainContainer.content);
main_layer.join();

const progressBars = mainContainer.sideBar.progressBars();
const processDots = mainContainer.sideBar.processDots();
const playButton = mainContainer.topContainer.toolbar.playButton;

console.debug('Renderer init')

VIEWS.landing = main_layer.content

playButton.onclick = async (e) => {
    const version_hash = await getCurrentVersionHash();
    processDots[version_hash].show();
    startMinecraft(version_hash);
}

window.onload = async (e) => {
    const preloader = qsl('#preloader');
    switchView(VIEWS.landing, 100, 100);
    if (await (window.__STANDALONE__ ? registerElectronEvents() : registerWSEvents()))
        setTimeout(() => {
            preloader.fadeOut(500, () => {
                preloader.remove();
                document.documentElement.classList.remove('preload');
            })
        }, 1000)
}

async function registerElectronEvents() {
    electron.on('open-settings', (e) => new Settings());
    electron.on('startup-success', (e, version_hash) => {
        progressBars[version_hash].hide();
        setTimeout(() => processDots[version_hash].hide(), 1000);
    });
    electron.on('startup-error', (e, error) => {
        console.warn(error)
        modal.alert('Что-то пошло не так...', error, 'error', { logType: true });
    });
    electron.on('error', (e, error) => {
        console.error(error);
        modal.alert('Ошибочка...', error, 'error', { logType: true });
    });
    electron.on('progress', (e, data) => {
        //console.debug(data);
        const version_hash = data.version_hash;
        if (data.progress > 0) {
            processDots[version_hash].hide();
            progressBars[version_hash].show();
        }
        if (data.progress <= 0) {
            progressBars[version_hash].hide();
            processDots[version_hash].show();
        }
        progressBars[data.version_hash].setPrecentage(data.progress * 100);
    });
    return true;
}

async function registerWSEvents(attempt = 0) {
    attempt++;
    if (attempt >= 3) {
        modal.alert("Ошибочка получается...", "Не возможно присоединиться к сокет-серверу вашего лаунчера!\n Возможно он не установлен или банально не запущен.\n Устраните неполадки и попробуйте снова!", null, {
            buttons: [{
                name: "Окей",
                class: ['filled', 'colorBrand'],
                closeOverlay: false,
                callback: () => location.reload()
            }],
            escButton: false,
            allowOutsideClick: false
        });
        return false;
    }
    const reconnect_timeout = 1;
    let ws = new WebSocket("ws://localhost:4836");
    ws.onopen = function(event) {
        ws.onmessage = function(event) {
            let msg = JSON.parse(event.data);
            parseEvent(msg);
        }
        return true;
    };
    ws.onclose = async (e) => {
        console.warn(`Socket is closed. Reconnect will be attempted in ${reconnect_timeout} second.`, e.reason);
        setTimeout(await registerWSEvents(attempt), reconnect_timeout * 1000);
    };
    const parseEvent = (event) => {
        switch (event.type) {
            case 'startup-success':
                progressBars[event.data].hide();
                setTimeout(() => processDots[event.data].hide(), 1000);
                break;
            case 'startup-error':
                console.warn(event.data)
                modal.alert('Что-то пошло не так...', event.data, 'error', { logType: true });
                break;
            case 'error':
                console.error(event.data);
                modal.alert('Ошибочка...', event.data, 'error', { logType: true });
                break;
            case 'progress':
                const version_hash = event.data.version_hash;
                if (event.data.progress > 0) {
                    processDots[version_hash].hide();
                    progressBars[version_hash].show();
                }
                if (event.data.progress <= 0) {
                    progressBars[version_hash].hide();
                    processDots[version_hash].show();
                }
                progressBars[version_hash].setPrecentage(event.data.progress * 100);
                break;
            default:
                break;
        }
    };
}