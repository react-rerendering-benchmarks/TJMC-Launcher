class Settings {
    constructor() {
        this.layer = new Layer({
            label: 'USER_SETTINGS'
        })
        //fetch('./settings.ejs').then(response => response.text()).then(text => {
            let text = this.getBase;
            this.layer.appendHTML(text)

            this.sidebar = this.layer.content.qsl('.sidebar')
            this.sidebarItems = this.sidebar.qsla('.navItem')
            this.content = this.layer.content.qsla('.content .tab')

            this.tools = createToolsContainer(() => {
                this.destroy()
            })
            this.layer.append(this.tools)

            this.bindSidebarItems()

            this.escBinder = new escBinder()
            this.escBinder.bind(() => {
                this.destroy()
            })

            this.setTab('my-account-tab')
            this.layer.show()
        //})
    }
    destroy() {
        this.escBinder.uibind()
        this.layer.destroy()
    }
    bindSidebarItems(){
        Array.from(this.sidebarItems).map((val) => {
            if(val.hasAttribute('rTi'))
                val.onclick = () => {
                    this.setTab(val.getAttribute('rTi'))
                }
        })
    }
    unbindSidebarItems(){
        Array.from(this.sidebarItems).map((val) => {
            if(val.hasAttribute('rTi')) val.onclick = () => {}
        })
    }
    setTab (tab) {
        this.content.forEach((el) => {
            el.toggle(el.id === tab)
        })
        this.sidebarItems.forEach((i) => {
            i.classList[i.getAttribute('rTi') === tab ? 'add' : 'remove']('selected')
        })
    }
    get getBase() {
        return /*html*/`
        <div class="sidebarView" id="user-settings">
            <div class="sidebar-region">
                <div class="sidebar">
                    ${this.getSideBar}
                </div>
            </div>
            <div class="content-region">
                <div class="transitionWrap">
                    <div class="content">
                        <div id="my-account-tab" class="tab hidden">
                            ${this.content.my_account_tab}
                        </div>
                        <div id="skin-tab" class="tab hidden">
                            ${this.content.skin_tab}
                        </div>
                        <div id="minecraft-settings" class="tab hidden">
                            ${this.content.minecraft_settings_tab}
                        </div>
                        <div id="java-settings" class="tab hidden">
                            ${this.content.java_settings_tab}
                        </div>
                        <div id="launcher-settings" class="tab hidden">
                            ${this.content.launcher_settings_tab}
                        </div>
                        <div id="about-tab" class="tab hidden">
                            ${this.content.about_tab}
                        </div>
                    </div>
                </div>
            </div>
        </div>
        `
    }
    get getSideBar() {
        return /*html*/`
            <div class="item header">Настройки пользователя</div>
            <div class="item navItem" rTi="my-account-tab">Моя учётная запись</div>
            <div class="item navItem" rTi="skin-tab">Сменить скин</div>
            <div class="item separator"></div>
            <div class="item header">Настройки Игры</div>
            <div class="item navItem" rTi="minecraft-settings">Игровые настройки</div>
            <div class="item navItem" rTi="java-settings">Настройки Java</div>
            <div class="item separator"></div>
            <div class="item navItem" rTi="launcher-settings">Настройки Лаунчера</div>
            <div class="item separator"></div>
            <div class="item navItem" rTi="about-tab">О нас</div>
        `
    }
    content = {
        get my_account_tab() {
            return /*html*/`
                <h2>Моя учётная запись</h2>
            `
        },
        get skin_tab() {
            return /*html*/`
                <h2>Конфигурация скина</h2>
            `
        },
        get minecraft_settings_tab() {
            return /*html*/`
                <h2>Настройки Minecraft</h2>
                <div class="children">
                    <div class="container-cc3V">
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. In sit amet diam vel nunc aliquet molestie. Nullam tincidunt sapien lacus, eget mattis lorem volutpat a. Aliquam blandit vehicula ultricies. Proin eget diam vitae elit fermentum laoreet quis sed justo. Donec eget mi bibendum, cursus lectus in, molestie est. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Sed aliquet mauris ut enim cursus, ut hendrerit turpis semper. Pellentesque tempor est lacus. Donec accumsan est a sem scelerisque, quis mattis ex ornare. Sed vitae erat eget augue dictum molestie a sit amet metus. Donec et ex nibh. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Pellentesque vehicula sit amet tortor non volutpat. Cras euismod tincidunt eros, nec porttitor metus fringilla vitae. In sodales mauris massa, quis faucibus est mollis ut.
                    </div>
                    <div class="separator"></div>
                    <div class="container-cc3V">
                        <h5>Как мы используем ваши данные</h5>
                        <div class="container-icf3v">
                            <div class="labelRow">
                                <label for="uid_1" class="title-3uvn">Использование данных для улучшения TJMC</label>
                                <div class="control">
                                    <label class="toggleSwitch">
                                        <input type="checkbox" cValue="Fullscreen" id="uid_1">
                                        <span class="toggleSwitchSlider"></span>
                                    </label>
                                </div>
                            </div>
                            <div class="note">
                                Эта настройка позволяет нам в аналитических целях использовать и обрабатывать информацию о том, как вы перемещаетесь по TJMC и используете его. Это позволяет, к примеру, давать вам доступ к тестированию новых функций.
                            </div>
                            <div class="divider separator"></div>
                        </div>
                        <div class="container-icf3v">
                            <div class="labelRow">
                                <label for="uid_2" class="title-3uvn">Использование данных для персонализации опыта использования TJMC</label>
                                <div class="control">
                                    <label class="toggleSwitch">
                                        <input type="checkbox" cValue="Fullscreen" id="uid_2">
                                        <span class="toggleSwitchSlider"></span>
                                    </label>
                                </div>
                            </div>
                            <div class="note">
                                Этот параметр позволяет нам использовать информацию (например, о том, с кем вы общаетесь или во что играете), чтобы настроить TJMC лично для вас. <a class="anchor" href="#">Подробнее</a>
                            </div>
                            <div class="divider separator"></div>
                        </div>
                    </div>
                </div>
            `
        },
        get java_settings_tab() {
            return /*html*/`
                <h2>Настройки Java</h2>
            `
        },
        get launcher_settings_tab() {
            return /*html*/`
                <h2>Настройки Лаунчера</h2>
            `
        },
        get about_tab() {
            return /*html*/`
                <h2>О нас</h2>
                <div class="children">
                    <div class="container-cc3V">
                        <h5>Просмотр информации о текущем релизе и заметки к выпуску</h5>
                        <div class="note">Lorem ipsum dolor sit amet, consectetur adipiscing elit. In sit amet diam vel nunc aliquet molestie. Nullam tincidunt sapien lacus, eget mattis lorem volutpat a. Aliquam blandit vehicula ultricies. Proin eget diam vitae elit fermentum laoreet quis sed justo. Donec eget mi bibendum, cursus lectus in, molestie est. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Sed aliquet mauris ut enim cursus, ut hendrerit turpis semper. Pellentesque tempor est lacus. Donec accumsan est a sem scelerisque, quis mattis ex ornare. Sed vitae erat eget augue dictum molestie a sit amet metus. Donec et ex nibh. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Pellentesque vehicula sit amet tortor non volutpat. Cras euismod tincidunt eros, nec porttitor metus fringilla vitae. In sodales mauris massa, quis faucibus est mollis ut.</div>
                    </div>
                </div>
            `
        }
    }
}