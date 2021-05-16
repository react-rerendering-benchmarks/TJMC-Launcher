class VersionChooser {
    
    constructor() {
        this.sidebar = new versionsSidebar();
        this.alertex = new AlertEx(
            { closeButton: true },
            createElement('div', { class: 'inner-container'}, this.Base)
        )
        this.refreshVersions()
    }

    refreshVersions(type = 'all') {
        API.VersionManager.getGlobalVersions().then((parsed) => {
            parsed = msort(parsed);
            const versions = parsed.filter((i) => { return type == 'all' ? true : i.type == type });
            const click = (e, item) => this.renderVersion(item)
            this.sidebar.removeAll();
            versions.forEach(version => this.sidebar.addItem(version, click));
        })
    }

    get Base() {
        this.main_content = this.createFisrtPage()
        const root = createElement('div', { class: 'container', id: 'version-selector' },
            createElement('div', { class: 'sidebar-main', id: 'version-list' },
                this.dropdown,
                this.createSidebar()
            ),
            createElement('div', { class: 'base', id: 'main' },
                this.main_content
            )
        )
        return root;
    }

    createSidebar() {
        const sidebar_items = [
            { type: 'navItem bgL' },
            { type: 'navItem bgL' },
            { type: 'navItem bgL' },
            { type: 'navItem bgL' },
            { type: 'navItem bgL' },
            { type: 'navItem bgL' }
        ];
        const items = sidebar_items.map(i => {
            const root_item = createElement('div', { class: 'item' + (i.type ? ' ' + i.type : '') });
            return root_item;
        });
        const sidebar = this.sidebar.createBase(...items);
        return sidebar;
    }

    get dropdown() {
        const dropdown_items = [
            { name: 'Release', type: 'release' },
            { name: 'Snapshot', type: 'snapshot' },
            { name: 'Modified', type: 'modified' },
            { name: 'Beta', type: 'old_beta' },
            { name: 'Alpha', type: 'old_alpha' },
        ];
        const dropdown = new DropdownSelector();
        const dropdowm_selector = dropdown.createSelector(dropdown_items);
        dropdown.onselect = (item) => {
            console.log(item)
            this.refreshVersions(item.type)
        }
        return dropdowm_selector;
    }

    createFisrtPage(props) {
        const root_content = createElement('div', { class: 'main-content centred' }, createElement('h1', null, 'Выберите версию'))
        return root_content;
    }

    createMainContent(props) {
        const version_opts = {
            name: props?.version?.id ? `Версия ${props.version.id}` : 'без имени'
        }
        const header = createElement('section', { class: 'VT-header'},
            createElement('h2', null, props?.version?.id ? `Создание установки версии ${props.version.id}` : 'Создание установки'),
            createElement('div', { class: 'full separator' })
        );
        /* ===== */
        const input_text = new Input({ type: 'text' });
        input_text.onchange = (e, value) => version_opts.name = value;
        const name_input = input_text.create({ placeholder: version_opts.name });
        /* ===== */
        const input_path = new Input({ type: 'path' });
        input_path.onchange = (e, path, files) => version_opts.gameDir = path;
        const file_input = input_path.create({ placeholder: '<папка по умолчанию>', button_name: 'Обзор' });
        /* ===== */
        const input_java_file = new Input({ type: 'file' });
        input_java_file.onchange = (e, path, files) => version_opts.javaPath = path;
        const java_file_input = input_java_file.create({ placeholder: '<использовать встроенную Java>', button_name: 'Обзор' });
        /* ===== */
        const input_jvm_opts = new Input({ type: 'text' });
        input_jvm_opts.onchange = (e, value) => version_opts.javaArgs = value;
        const jvm_options_input = input_jvm_opts.create({ placeholder: 'Java Arguments' });
        /* ===== */
        const input_resolution = new Input({ type: 'resolution' });
        input_resolution.onchange = (e, value) => version_opts.resolution = value;
        const resolution_input = input_resolution.create({ w_placeholder: '<авто>', h_placeholder: '<авто>'});
        /* ===== */
        const root_flex = createElement('div', { class: 'VT-flex-box' },
            createElement('div', { class: 'children-zx1' },
                createElement('label', { class: '', for: 'name' }, 'Название'),
                name_input
            ),
            createElement('div', { class: 'children-zx1' },
                createElement('label', { class: '', for: 'dir'}, 'Папка игры'),
                file_input
            ),
            createElement('div', { class: 'children-zx1' },
                createElement('label', { class: '', for: 'res' }, 'Разрешение'),
                resolution_input
            ),
            createElement('div', { class: 'children-zx1' },
                createElement('label', { class: '', for: 'dir'}, 'Путь к java'),
                java_file_input
            ),
            createElement('div', { class: 'children-zx1' },
                createElement('label', { class: '', for: 'name' }, 'Параметры JVM'),
                jvm_options_input
            )
        )
        const cancel_button = createElement('button', { class: '' }, 'Отмена')
        cancel_button.onclick = () => this.alertex.destroy()
        const accept_button = createElement('button', { class: 'primary-button' }, 'Создать')
        accept_button.onclick = () => 
            this.addVersion(props.version.id, version_opts).then(() => {
                refreshVersions();
                this.alertex.destroy();
            })
        const footer = createElement('section', { class: 'VT-footer' },
            createElement('div', { class: 'full separator' }),
            cancel_button, accept_button
        )
        const root_content = createElement('div', { class: 'main-content' },
            header,
            root_flex,
            footer
        );
        return root_content;
    }

    renderVersion(version) {
        const main_content = this.createMainContent({
            version: version
        })
        this.main_content.replaceWith(main_content)
        this.main_content = main_content
    }

    /**
     * Create new version configuration
     * @param {String} version - Version identifier
     * @param {Object} options - Options for version
     * @param {Object} options.name - Name of the version
     * @param {Object} options.gameDir - Directory of the version
     * @param {Object} options.javaPath - Path to executable java file
     * @param {Object} options.javaArgs - Arguments for java machine
     * @param {Object} options.resolution - Resolution of the game window
     * @param {Object} options.resolution.width - Width of the game window
     * @param {Object} options.resolution.height - Height of the game window
     */
    async addVersion(version, options = {}) {
        await API.VersionManager.createInstallation(version, options);
    }
}