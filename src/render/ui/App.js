import { memo, createElement, useEffect } from "react";

import { getDispatch } from "Util/Store.js";
import useGlobal from "Hooks/useGlobal.js";
import useConstructor from "Hooks/useConstructor.js";

import Preloader from "./Preloader.js";
import Auth from "./Auth/Auth.js";
import Main from "./Main.js";

const AppContainer = memo(() => {

	const { initHost, openSettingsModal } = getDispatch();
	useConstructor(() => initHost());

	useEffect(() => {
		electron.on('open-settings', (e, data) => openSettingsModal()); // Send global event to open settings [electron]
	}, [openSettingsModal]);

	return (
		<div className="app-container">
			<Main />
			<div class="uploadArea" />
		</div>
	);
});

const App = memo(() => {

	const { initApi } = getDispatch();
	useConstructor(() => initApi());

	const isAuthReady = useGlobal(global => global.auth_state) == "ready";

	return (
		<div class="app">
			{isAuthReady ? <AppContainer /> : <Auth />}
			<Preloader />
		</div>
	);
});

export default App;
