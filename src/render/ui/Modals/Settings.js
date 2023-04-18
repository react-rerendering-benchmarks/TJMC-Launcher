import { memo, createElement, useCallback, useMemo, useState, useEffect, Fragment } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

import buildClassName from "Util/buildClassName.js";
import { getDispatch } from "Store/Global";
import { randomString } from "Util/Random.js";

import useGlobal from "Hooks/useGlobal";
import useHostOnline from "Hooks/useHostOnline";
import { selectCurrentUser } from "Model/Selectors/user.js";
import { selectCurrentTheme } from "Model/Selectors/UI";
import { selectSettings } from "Model/Selectors/Settings";
import bytesToSize from "Util/bytesToSize";
import platform from "platform";

import { RadioGroup } from "UI/components/Radio.js";
import ToggleSwitch from "UI/components/ToggleSwitch.js";
import RangeSlider from "UI/components/Slider.js";
import { Modal } from "UI/Modals";
import Select from "UI/components/Select";
import MenuItem from "UI/components/MenuItem";
import { InputGroup, PathInput } from "UI/components/Input";
import Button from "UI/components/Button";

import iconImage from "IMG/icon.png";
import style from "CSS/settings.module.css";
import "CSS/markdown.css";
import SettingSwitch from "UI/components/SettingSwitch";
import SettingButton from "UI/components/SettingButton";
import SettingContainer from "UI/components/SettingContainer";


const SideBarItems = ({ currentScreen, onScreenSelect }) => {

	const hostOnline = useHostOnline();

	const items = useMemo(() => [
		{ type: "header", content: "Настройки пользователя" },
		{ type: "navItem", content: "Моя учётная запись", tab: "my-account", disabled: false },
		{ type: "navItem", content: "Сменить скин", tab: "skin", disabled: false },
		{ type: "separator" },
		{ type: "header", content: "Настройки Игры" },
		{ type: "navItem", content: "Игровые настройки", tab: "minecraft-settings", disabled: !hostOnline },
		{ type: "navItem", content: "Настройки Java", tab: "java-settings", disabled: !hostOnline },
		{ type: "separator" },
		{ type: "header", content: "Настройки Приложения" },
		{ type: "navItem", content: "Внешний вид", tab: "launcher-appearance", disabled: false },
		{ type: "navItem", content: "Настройки лаунчера", tab: "launcher-settings", disabled: false },
		{ type: "separator" },
		{ type: "navItem", content: "О программе", tab: "launcher-about", disabled: false },
		{ type: "separator" },
	], [hostOnline]);

	const handleSelect = (tab) => tab ? () => {
		onScreenSelect(tab);
	} : undefined;

	return (
		<div className="sidebar-items">
			{items.map((e, i) => (
				<div key={i}
					className={buildClassName("item", e.type, e.tab == currentScreen && "selected", e.disabled && "disabled")}
					onClick={handleSelect(e.tab)}>
					{e.content || ''}
				</div>
			))}
		</div>
	);
};

const InfoBox = memo(() => {
	const os = platform.os;
	const host = useGlobal(global => global.hostInfo);
	return (
		<div className={style.sidebarInfo}>
			<span className={buildClassName(style.line, style.size12)}>
				{APP_ENV == "production" ? "Stable" : "Development"} {APP_VERSION} <span className={style.versionHash}>({window.buildInfo.gitHashShort})</span>
			</span>
			<span className={buildClassName(style.line, style.size12)}>{host.hostVersion ? `${host.hostVendor} ${host.hostVersion.version}` : "Web Host"}</span>
			<span className={buildClassName(style.line, style.size12)}>{os ? `${os.family} ${os.version} x${os.architecture}` : "Unknown OS"}</span>
			<br />
			{APP_ENV == "development" && (
				<Fragment>
					<span className={buildClassName(style.line, style.size12)}>Packages:</span>
					{Object.entries(window.tjmcNative.versions).map(([k, v]) =>
						(<span key={k} className={buildClassName(style.line, style.size12)}>{`${k}\xa0${v}`}</span>)
					)}
				</Fragment>
			)}
		</div>
	);
});

const TabItem = (({ id, children }) => {
	return <div className="tab" id={id}>{children}</div>;
});

const TestContainer = memo(() => {
	const [selectedIndex, selectIndex] = useState(0);
	const [checked, setChecked] = useState(false);
	const [count, setCount] = useState(0);
	const items = [
		"Item 0",
		"Item 1",
		"Item 2",
		"Item 3",
		"Item 4",
		"Item 5",
		"Item 6",
		"Item 7",
		"Item 8",
		"Item 9",
	];
	return (
		<div className={style.settingGroupContainer}>
			<h5>Debug container</h5>
			<div className={buildClassName(style.settingGroup, style.withBorder)}>
				<SettingContainer note={"You can use selectable menu"} inputMode>
					<div className={"test"}>
						<Select title="Select item" value={items[selectedIndex]}>
							{items.map((e, i) => (
								<MenuItem compact
									key={i}
									selected={selectedIndex == i}
									onClick={() => selectIndex(i)}
								>{e}</MenuItem>
							))}
						</Select>
					</div>
				</SettingContainer>
				<SettingSwitch
					id={"tjmc.app.example.switch"}
					checked={checked}
					action={setChecked}
					note={"Here is the example of setting container toggler. You can switch it!"}
					title={"Toggle this switch"}
				/>
				<SettingButton
					id={"tjmc.app.example.button"}
					note={`Here is the example of setting container button. You can click on it!`}
					title={`Click on button${count > 0 ? `\xa0-\xa0${count}` : ""}`}
					name={"Click"}
					action={() => setCount(s => s + 1)}
				/>
				<SettingSwitch
					id={"tjmc.app.example.switch"}
					checked={checked}
					action={setChecked}
					title={"Toggle this switch with long text inside title box"}
				/>
				<SettingButton
					id={"tjmc.app.example.button"}
					title={`Click on button with long text in title here${count > 0 ? `\xa0-\xa0${count}` : ""}`}
					name={"Click"}
					action={() => setCount(s => s + 1)}
				/>
				<SettingContainer inputMode note={"You can easily write single description text"} />
			</div>
		</div>
	);
});


const MyAccountTab = memo(() => {

	const { logout, closeModal } = getDispatch();
	const user = useGlobal(selectCurrentUser);

	const handleChangeClick = useCallback(() => {
		window.open(`https://www.tjmc.ru/login/main.php`);
	}, []);

	const onLogoutClick = useCallback(() => {
		logout();
		closeModal();
	}, [logout, closeModal]);

	return user && (
		<TabItem id="my-account">
			<h2>Моя учётная запись</h2>
			<div className="children">
				<div className={style.settingGroupContainer}>
					<div className="bxcF1-box">
						<div className="ictx-flex">
							<div className={buildClassName("icon", "ns")}>
								<span style={{
									backgroundImage: user.avatar != void 0 ?
										`url(https://cdn.tjmc.ru/avatars/${user.id}/${user.avatar}.png?size=64)` :
										`url(https://api.tjmc.ru/v1/skin.render?user=${user.username}&headOnly=true&vr=-25&hr=35)`
								}} className="accountAvatar" />
							</div>
							<div className={buildClassName("flex-group", "vertical")}>
								<span className={buildClassName("vbx", "cu")}>
									<div className={buildClassName("text", "name")}>{`${user.realname || user.username}`}</div>
									<div className={buildClassName("text", "id")}>{`#${user.discriminator}`}</div>
								</span>
								{user.permission_display_name && (
									<div className={buildClassName("sizeW", "colorStandart", "subtitle-p")}>{user.permission_display_name}</div>
								)}
							</div>
							{/* <button className={buildClassName("r", "filled", "colorBrand")}>{"Профиль"}</button> */}
						</div>
						<div className="separator" />
						{[user.email].some(Boolean) && (
							<div className="fieldList">
								{user.email && (
									<div className="field" data-type="email">
										<div className="containedRow">
											<div>
												<h5>{"Email"}</h5>
												<div>
													<span className="colorHeaderPrimary">{user.email}</span>
												</div>
											</div>
										</div>
										<button className="filled" onClick={handleChangeClick}>{"Изменить"}</button>
									</div>
								)}
							</div>
						)}
						<button className={buildClassName("filled", "colorRed", "w100")} onClick={onLogoutClick}>{"Выйти"}</button>
					</div>
				</div>
				{APP_ENV == "development" && (
					<TestContainer />
				)}
			</div>
		</TabItem>
	);
});

const SkinTab = memo(() => {
	const user = useGlobal(selectCurrentUser);

	const handleChangeClick = useCallback(() => {
		window.open(`https://www.tjmc.ru/login/skinch.php`);
	}, []);

	const handleDownloadClick = useCallback(() => {
		window.open(`https://api.tjmc.ru/v1/skin.render?user=${user.username}&format=raw&dl=true`);
	}, [user]);

	return user && (
		<TabItem id="skin">
			<h2>Конфигурация скина</h2>
			<div className="children">
				<div className={style.settingGroupContainer}>
					<div className="bxcF1-box">
						<div className="skin-flex">
							<img src={`https://api.tjmc.ru/v1/skin.render?user=${user.username}&ratio=18&vr=-25&hr=35`} />
							<img src={`https://api.tjmc.ru/v1/skin.render?user=${user.username}&ratio=18`} />
							<img src={`https://api.tjmc.ru/v1/skin.render?user=${user.username}&ratio=18&hr=90`} />
						</div>
						<button className={buildClassName("filled", "colorBrand", "w100")} onClick={handleChangeClick}>{"Изменить"}</button>
						<button className={buildClassName("filled", "w100")} onClick={handleDownloadClick}>{"Скачать"}</button>
					</div>
				</div>
			</div>
		</TabItem>
	);
});

const MinecraftSettingsTab = memo(() => {

	const { setConfig } = getDispatch();
	const config = useGlobal(global => global.configuration);

	const [width, setWidth] = useState("0");
	const [height, setHeight] = useState("0");

	useEffect(() => setWidth(config?.minecraft?.launch?.width), [config?.minecraft?.launch?.width]);
	useEffect(() => setHeight(config?.minecraft?.launch?.height), [config?.minecraft?.launch?.height]);

	const handleSaveConfigWidth = useCallback(() => {
		setConfig({ key: "minecraft.launch.width", value: width });
	}, [setConfig, width]);
	const handleSaveConfigHeight = useCallback(() => {
		setConfig({ key: "minecraft.launch.height", value: height });
	}, [setConfig, height]);

	return (
		<TabItem id="minecraft-settings">
			<h2>Настройки Minecraft</h2>
			{config ? (
				<div className="children">
					<div className={style.settingGroupContainer}>
						<h5>Параметры окна</h5>
						<div className="resolution" id="settings.resolution.wrap">
							<input
								type="number"
								name="settings-resolution-width"
								value={width}
								onChange={(e) => setWidth(e.target.value)}
								onBlur={handleSaveConfigWidth}
								placeholder={"<auto>"} />
							<span className="resolutionCross">✖</span>
							<input
								type="number"
								name="settings-resolution-height"
								value={height}
								onChange={(e) => setHeight(e.target.value)}
								onBlur={handleSaveConfigHeight}
								placeholder={"<auto>"} />
						</div>
						<div className={style.settingGroup}>
							<SettingSwitch id="minecraft.launch.fullscreen"
								title="Запускать в полноэкранном режиме"
								note="Принудительно использовать режим fullscreen для нового окна"
								checked={config.minecraft.launch.fullscreen}
								action={(s) => {
									setConfig({ key: "minecraft.launch.fullscreen", value: s });
								}}
							/>
						</div>
					</div>
					<div className={style.settingGroupContainer}>
						<h5>Параметры запуска</h5>
						<div className={style.settingGroup}>
							<SettingSwitch id="overrides.autoConnect"
								title="Автоматически подключаться к серверу ТюменьCraft"
								note="Подключаться к серверу автоматически, при запуске игры"
								checked={config.minecraft.autoConnect}
								action={(s) => {
									setConfig({ key: "minecraft.autoConnect", value: s });
								}}
							/>
						</div>
					</div>
					<div className={style.settingGroupContainer}>
						<h5>Параметры загрузки</h5>
						<div className={style.settingGroup}>
							<SettingSwitch id="overrides.checkHash"
								title="Требовать проверку целостности файлов"
								note={"Эта опция позволяет вам отключать проверку хеша файлов. \nНе рекомендуется отключать, так как обновления файлов не будут скачаны автоматически!"}
								checked={config.overrides.checkHash}
								disabled={!config.overrides.checkFiles}
								action={(s) => {
									setConfig({ key: "overrides.checkHash", value: s });
								}}
							/>
							<SettingSwitch id="overrides.checkFiles"
								title="Требовать проверку наличия файлов"
								note={"Эта опция позволяет вам отключать проверку файлов. \nНе рекомендуется отключать, так как отсутствие файлов не будет зарегистрировано!"}
								checked={config.overrides.checkFiles}
								action={(s) => {
									setConfig({ key: "overrides.checkFiles", value: s });
								}}
							/>
						</div>
					</div>
				</div>
			) : (
				<div className="children">
					<h5>No config loaded!</h5>
				</div>
			)}
		</TabItem>
	);
});

const JavaSettingsTab = memo(() => {

	const { setConfig } = getDispatch();
	const config = useGlobal(global => global.configuration);

	const [javaArgs, setJavaArgs] = useState("");

	useEffect(() => setJavaArgs(config?.java?.args), [config?.java?.args]);

	const handleChangeJavaPath = useCallback((javaPath) => {
		setConfig({ key: "java.path", value: javaPath });
	}, [setConfig]);

	const handleSaveJavaArgs = useCallback(() => {
		setConfig({ key: "java.args", value: javaArgs });
	}, [setConfig, javaArgs]);

	return (
		<TabItem id="java-settings">
			<h2>Настройки Java</h2>
			{config ? (
				<div className="children">
					<div className={style.settingGroupContainer}>
						<h5>Исполняемый файл</h5>
						<PathInput
							type="file"
							placeholder="<java:path>"
							onChange={handleChangeJavaPath}
							value={config?.java?.path}
						/>
					</div>
					<div className={style.settingGroupContainer}>
						<h5>Дополнительные аргументы</h5>
						<InputGroup htmlFor="settings.java.args.input">
							<input id="settings.java.args.input"
								type="text"
								name="settings-java-args"
								value={javaArgs}
								onChange={(e) => setJavaArgs(e.target.value)}
								onBlur={handleSaveJavaArgs}
								placeholder="<java:args>" />
						</InputGroup>
					</div>
					<div className={style.settingGroupContainer}>
						<h5>Использование памяти</h5>
						<div className={style.settingGroup}>
							<SettingContainer inputMode>
								<div className={buildClassName("flex-group", "vertical")}>
									<div className={buildClassName("flex-child", "flex-group", "vertical")}>
										<h5>Максимальное использование памяти</h5>
										<RangeSlider id="java-memory-max"
											value={Math.round((config.java.memory.max / 1024) * 1000) / 1000}
											min={0.5}
											max={8}
											step={0.1}
											unit="Gb"
											onChange={(s) => {
												setConfig({ key: "java.memory.max", value: Math.floor(s * 1024) });
											}}
										/>
									</div>
									<div className={buildClassName("flex-child", "flex-group", "vertical")}>
										<h5>Минимальное использование памяти</h5>
										<RangeSlider id="java-memory-min"
											value={Math.round((config.java.memory.min / 1024) * 1000) / 1000}
											min={0.5}
											max={5}
											step={0.1}
											unit="Gb"
											onChange={(s) => {
												setConfig({ key: "java.memory.min", value: Math.floor(s * 1024) });
											}}
										/>
									</div>
								</div>
							</SettingContainer>
						</div>
					</div>
					<div className={style.settingGroupContainer}>
						<h5>Дополнительно</h5>
						<div className={style.settingGroup}>
							<SettingSwitch id="java.detached"
								title="Независимый процесс"
								note="Если этот параметр выключен, то при закрытии лаунчера, автоматически закроется процесс игры"
								checked={config.java.detached}
								action={(s) => {
									setConfig({ key: "java.detached", value: s });
								}}
							/>
						</div>
					</div>
				</div>
			) : (
				<div className="children">
					<h5>No config loaded!</h5>
				</div>
			)}
		</TabItem>
	);
});

const LauncherSettingsTab = memo(() => {

	const { setSettings, setConfig, alert } = getDispatch();
	const settings = useGlobal(selectSettings);
	const config = useGlobal(global => global.configuration);
	const hostOnline = useHostOnline();

	return (
		<TabItem id="launcher-settings">
			<h2>Настройки Лаунчера</h2>
			<div className="children">
				{hostOnline && config && (
					<div className={style.settingGroupContainer}>
						<h5>Настройки клиента</h5>
						<div className={style.settingGroup}>
							<SettingSwitch id="launcher.checkUpdates"
								title="Проверять обновления"
								note="Отключение этого параметра позволяет пропускать проверку обновлений при холодном запуске."
								checked={config.launcher.checkUpdates}
								action={(s) => {
									setConfig({ key: "launcher.checkUpdates", value: s });
								}}
							/>
							<SettingSwitch id="launcher.hideOnClose"
								title="Скрывать при закрытии"
								note="Включение этого параметра позволяет скрывать лаунчер в трей при нажатии на кнопку закрыть."
								checked={config.launcher.hideOnClose}
								action={(s) => {
									setConfig({ key: "launcher.hideOnClose", value: s });
								}}
							/>
							<SettingSwitch id="launcher.disableHardwareAcceleration"
								title="Отключить программную акселерацию"
								note="Включение этого параметра позволяет отключить программное ускорение. Может вызвать проблемы на некоторых системах!"
								checked={config.launcher.disableHardwareAcceleration}
								action={(s) => {
									alert({
										title: `${s ? "Отключение" : "Включение"} программного ускорения`,
										content: `Изменение этого параметра может вызвать подвисания или полный отказ приложения. Используйте эту опцию, только если уверенны в том что делаете! Вы действительно хотите ${s ? "включить" : "выключить"} этот параметр?`,
										type: "warn",
										buttons: [
											{
												name: "Отмена",
												closeOverlay: true,
											},
											{
												name: `${s ? "Отключить" : "Включить"}`,
												class: ["filled", "colorRed"],
												closeOverlay: true,
												callback: () => {
													setConfig({ key: "launcher.disableHardwareAcceleration", value: Boolean(s) });
												}
											}
										],
										mini: true,
									});

								}}
							/>
							<SettingSwitch id="launcher.openDevTools"
								title="Открывать средства разработчика"
								note="Включение этого параметра позволяет скрывать и показывать средства разработчика"
								checked={config.launcher.openDevTools}
								action={(s) => {
									setConfig({ key: "launcher.openDevTools", value: s });
								}}
							/>
						</div>
					</div>
				)}
				<div className={style.settingGroupContainer}>
					<h5>Базовая Отладка</h5>
					<div className={style.settingGroup}>
						<SettingSwitch id="app.debug.mode"
							title="Использование режима отладки"
							note="Включение этого параметра позволяет разработчикам получать больше данных об ошибках в консоли приложения."
							checked={settings.debug_mode}
							action={(s) => {
								alert({
									title: "Изменение режима отладки",
									content: "Изменение параметра режима отладки требует перезапуска приложения. Вы уверенны что хотите это сделать?",
									type: "warn",
									buttons: [
										{
											name: "Отмена",
											closeOverlay: true,
										},
										{
											name: "Ок",
											class: ["filled", "colorBrand"],
											closeOverlay: true,
											callback: () => {
												setSettings({ debug_mode: Boolean(s) });
											}
										}
									],
									mini: true,
								});
							}}
						/>
					</div>
				</div>
				<div className={style.settingGroupContainer}>
					<h5>Отладка сетевых данных</h5>
					<div className={style.settingGroup}>
						<SettingSwitch id="app.debug.host"
							title="Высерание данных для отладки хоста"
							note="Эта настройка позволяет разработчикам получать дополнительную информацию о взаимодействии клиента с хостом через IPC или TCHost соединение"
							checked={settings.debug_host}
							action={(s) => {
								alert({
									title: "Изменение режима отладки",
									content: "Изменение параметра режима отладки требует перезапуска приложения. Вы уверенны что хотите это сделать?",
									type: "warn",
									buttons: [
										{
											name: "Отмена",
											closeOverlay: true,
										},
										{
											name: "Ок",
											class: ["filled", "colorBrand"],
											closeOverlay: true,
											callback: () => {
												setSettings({ debug_host: Boolean(s) });
											}
										}
									],
									mini: true,
								});
							}}
						/>
						<SettingSwitch id="app.debug.api"
							title="Высерание данных для отладки API"
							note="Этот параметр позволяет разработчикам получать необязательную информацию о запросах происходящих между клиентом и TJMC API"
							checked={settings.debug_api}
							action={(s) => {
								alert({
									title: "Изменение режима отладки",
									content: "Изменение параметра режима отладки требует перезапуска приложения. Вы уверенны что хотите это сделать?",
									type: "warn",
									buttons: [
										{
											name: "Отмена",
											closeOverlay: true,
										},
										{
											name: "Ок",
											class: ["filled", "colorBrand"],
											closeOverlay: true,
											callback: () => {
												setSettings({ debug_api: Boolean(s) });
											}
										}
									],
									mini: true,
								});
							}}
						/>
					</div>
				</div>
			</div>
		</TabItem>
	);
});

const LauncherAppearanceTab = memo(() => {

	const { setSettings, setTheme } = getDispatch();
	const settings = useGlobal(selectSettings);
	const theme = useGlobal(selectCurrentTheme);

	return (
		<TabItem id="launcher-appearance">
			<h2>Внешний вид</h2>
			<div className="children">
				<div className={style.settingGroupContainer}>
					<h5>Тема</h5>
					<RadioGroup
						direction="vertical"
						checked={theme}
						options={{
							dark: (<span>Тёмная</span>),
							light: (<span>Светлая</span>),
							system: (<span>Синхронизация с ПК</span>),
						}}
						action={(theme) => {
							setTheme(theme);
						}}
					/>
					<div className={style.settingGroup}>
						<SettingSwitch id="exp.settings.more_border"
							title="Режим чётких границ"
							note="Включение этого параметра позволяет использовать экспериментальный режим повышенной чёткости границ."
							checked={settings.exp_more_border}
							action={(s) => {
								setSettings({ exp_more_border: Boolean(s) });
							}}
						/>
					</div>
				</div>
				<div className={style.settingGroupContainer}>
					<h5>Общие</h5>
					<div className={style.settingGroup}>
						<SettingSwitch id="app.settings.fullmode"
							title="Использовать настройки в полноэкранном режиме"
							note="Включение этого параметра позволяет использовать настройки в полноэкранном режиме"
							checked={settings.full_settings}
							action={(s) => {
								setSettings({ full_settings: Boolean(s) });
							}}
						/>
						<SettingSwitch id="app.chooser.fullmode"
							title="Использовать установщик версии в полноэкранном режиме"
							note="Включение этого параметра позволяет использовать установщик версии в полноэкранном режиме"
							checked={settings.full_chooser}
							action={(s) => {
								setSettings({ full_chooser: Boolean(s) });
							}}
						/>
					</div>
				</div>
				<div className={style.settingGroupContainer}>
					<h5>Дополнительно</h5>
					<div className={style.settingGroup}>
						<SettingSwitch id="app.preloader.mode"
							title="Использовать прелоадер"
							note="Выключение этого параметра позволяет принудительно отключать анимацию первоначальной загрузки приложения"
							checked={settings.enable_preloader}
							action={(s) => {
								setSettings({ enable_preloader: Boolean(s) });
							}}
						/>
						{APP_ENV == "development" && (
							<SettingSwitch id="app.dev.faloc_disable"
								title="Отключить сообщение о предварительной версии"
								note="Включение этого параметра отключает появление сообщение о предварительной версии при запуске UI"
								checked={settings.dev_disable_faloc}
								action={(s) => {
									setSettings({ dev_disable_faloc: Boolean(s) });
								}}
							/>
						)}
					</div>
				</div>
			</div>
		</TabItem>
	);
});

const UpdatesContainer = memo(() => {

	const { updateCheck, updateDownload, updateInstall } = getDispatch();
	const {
		status: updateStatus,
		progress: updateProgress,
		next: nextUpdate,
		total, transferred, bytesPerSecond
	} = useGlobal(global => global.update);

	const titleName = {
		"not-available": "Нет обновлений",
		available: `Доступно обновление${nextUpdate != void 0 ? `:\xa0${nextUpdate.releaseName}` : ""}`,
		checking: "Проверка обновлений...",
		error: "Ошибка обновления",
		loading: `Загрузка обновления...${total != void 0 ? `\xa0${bytesToSize(transferred)} из ${bytesToSize(total)}\xa0(${bytesToSize(bytesPerSecond, true)})\xa0` : ""}`,
		loaded: `Загружено обновление${nextUpdate != void 0 ? `:\xa0${nextUpdate.releaseName}` : ""}`,
	}[updateStatus] || "Unknown update status";

	const buttonName = {
		"not-available": "Проверить",
		available: "Скачать",
		checking: "Подождите...",
		error: "Ошибка",
		loaded: "Перезапустить",
		loading: "Загрузка...",
	}[updateStatus] || "Action";

	const updateAction = useCallback(() => {
		return (({
			"not-available": updateCheck,
			available: updateDownload,
			loaded: updateInstall,
		})[updateStatus] || (() => { }))();
	}, [updateStatus, updateCheck, updateDownload, updateInstall]);

	function renderProgress(value) {
		return updateStatus == "loading" && (<progress className="w100" max={100} value={value} />);
	}

	return (
		<div className={buildClassName(style.settingGroup, style.withBorder)}>
			<SettingContainer note={renderProgress(updateProgress)} title={titleName}>
				<Button
					onClick={updateAction}
					className={buildClassName("filled", "small")}
					isLoading={updateStatus == "loading" || updateStatus == "checking"}
					isPrimary={updateStatus == "available"}
					isRed={updateStatus == "loaded"}
					disabled={updateStatus == "loading" || updateStatus == "checking"}
				>{buttonName}</Button>
			</SettingContainer>
		</div>
	);
});

const AboutTab = memo(() => {

	const { openWhatsNewModal } = getDispatch();
	const releases = useGlobal(global => global.releases);

	const whats_new_click = useCallback(() => {
		openWhatsNewModal();
	}, [openWhatsNewModal]);

	return (
		<TabItem id="launcher-about">
			<h2>О программе</h2>
			<div className="children">
				<div className={style.settingGroupContainer}>
					<div className="bxcF1-box">
						<div className={buildClassName("pctx-flex")}>
							<div className="ictx-flex">
								<div className="icon"><img src={iconImage} /></div>
								<div className={buildClassName("flex-group", "vertical")}>
									<span className="vbx">
										<div className={buildClassName("text", "name")}>{APP_NAME}</div>
										<div className={buildClassName("text", "version")}>v{APP_VERSION}</div>
									</span>
									<div className={buildClassName("sizeW", "colorStandart", "subtitle-p")}>
										<span>Играйте, не обляпайтесь!</span>
									</div>
								</div>
							</div>
							<button className={buildClassName("r", "filled", "colorBrand")} onClick={whats_new_click}>
								<span>Подробнее</span>
							</button>
						</div>
						<div className="separator" />
						<div className={buildClassName("note", "nowrap", "tran-s")}>
							<div className="description">{APP_COPYRIGHT}</div>
							<span className={buildClassName("flex-group", "horizontal")}>
								<a href="https://github.com/tjmcraft/TJMC-Launcher" className="anchor" target="_blank" rel="noreferrer">Source (GitHub)</a>
								<a href="https://www.tjmc.ru/help" className="anchor" target="_blank" rel="noreferrer">Поддержка</a>
								<a href="https://www.tjmc.ru/launcher" className="anchor" target="_blank" rel="noreferrer">Сайт</a>
							</span>
						</div>
					</div>
					<UpdatesContainer />
					<div className="bxcF1-box">
						<h5>Просмотр информации о предыдущих релизах</h5>
						<div className="separator" />
						<div className="flex-group vertical">
							{releases && releases.map((release, i) => release.tag_name != `v${APP_VERSION}` && (
								<div key={i} className={buildClassName("release", "w100")}>
									<div className={buildClassName("pctx-flex", "alt")}>
										<div className={buildClassName("ictx-flex", "align-top")}>
											<div className="icon">
												<img src={release.author.avatar_url} />
												<span>{release.author.login}</span>
											</div>
											<div className={buildClassName("flex-group", "vertical", "w100", "text-sel")}>
												<span className="vbx">
													<a href={release.html_url} className={buildClassName("text", "name", "sizeE")}>{release.name}</a>
													<div className={buildClassName("text", "version", "sizeQ")}>#{release.id}</div>
												</span>
												<div className={buildClassName("colorStandart", "size14")}>
													<span className="markdown">
														<Markdown remarkPlugins={[remarkGfm]} children={release.body} />
													</span>
												</div>
											</div>
										</div>
									</div>
									{releases.length - 1 != i && <div className="separator" />}
								</div>
							))}
						</div>
					</div>
				</div>
			</div>
		</TabItem>
	);
});

const ActiveTab = ({ current }) => {
	switch (current) {
		case "my-account":
			return (<MyAccountTab />);
		case "skin":
			return (<SkinTab />);
		case "minecraft-settings":
			return (<MinecraftSettingsTab />);
		case "java-settings":
			return (<JavaSettingsTab />);
		case "launcher-settings":
			return (<LauncherSettingsTab />);
		case "launcher-appearance":
			return (<LauncherAppearanceTab />);
		case "launcher-about":
			return (<AboutTab />);
		default:
			return (<h5>Loading...</h5>);
	}
};

const Settings = (props) => {

	const { selectSettingsScreen } = getDispatch();
	const currentSettingsScreen = useGlobal(global => global.currentSettingsScreen);

	const handleScreenSelect = useCallback((screen) => {
		selectSettingsScreen(screen);
	}, [selectSettingsScreen]);

	const { full_settings: shouldFull } = useGlobal(global => global.settings);

	return (
		<Modal {...props} full={shouldFull}>
			<div className="sidebarView" id="user-settings">
				<div className="sidebar-region">
					<div className="sidebar">
						<SideBarItems
							currentScreen={currentSettingsScreen}
							onScreenSelect={handleScreenSelect}
						/>
						<InfoBox />
					</div>
				</div>
				<div className="content-region">
					<div className="transitionWrap">
						<div className={buildClassName("content", "auto-s", !shouldFull && "centred")}>
							<ActiveTab current={currentSettingsScreen} />
						</div>
					</div>
				</div>
			</div>
		</Modal>
	);
};

export default memo(Settings);