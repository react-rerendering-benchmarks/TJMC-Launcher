import { Fragment, createElement, memo, useCallback, useEffect, useState } from "react";

import { getDispatch } from "Store/Global";
import buildClassName from "Util/buildClassName";
import useGlobal from "Hooks/useGlobal";
import { pick } from "Util/Iterates";

import { InputPassword, InputText } from "UI/components/Input";
import Button from "UI/components/Button";

import style from "CSS/auth.module.css";
import useShowTransition from "Hooks/useShowTransition";
import captureKeyboardListeners from "Util/captureKeyboard";

// TODO: Implement multiscreen authState support
// Need to implement multiAuthState support under API Requests and API itself

const Authentication = () => {

	const { auth_state, authIsLoading, authError } = useGlobal(global => pick(global, [
		'auth_state', 'authIsLoading', 'authError'
	]));

	const { requestAuth } = getDispatch();

	const [login, setLogin] = useState('');

	const canSubmit = login.length > 0;

	const onLoginChange = (e) => {
		const { value } = e.target;
		setLogin(value);
	};

	const handleOfflineAuth = useCallback(() => {
		if (authIsLoading || !canSubmit) return;
		requestAuth({login});
	}, [requestAuth, authIsLoading, canSubmit, login]);

	const handleTJMCIDAuth = useCallback(() => {
		requestAuth({ login: undefined });
	}, [requestAuth]);

	useEffect(() => {
		console.debug(">> authState", auth_state);
	}, [auth_state]);

	useEffect(() => {
		console.debug(">> authIsLoading", authIsLoading);
	}, [authIsLoading]);

	useEffect(() => {
		authError && console.debug(">> authError", authError);
	}, [authError]);

	useEffect(() => captureKeyboardListeners({ onEnter: handleOfflineAuth }), [handleOfflineAuth]);

	return (
		<Fragment>
			<div className={style.wrapper}>
				<div className={style.authBox}>
					<div className={style.mainLoginContainer}>
						<div className={style.header}>
							<p className={buildClassName(style.title)}>{"Добро пожаловать!"}</p>
							<p className={buildClassName(style.subtitle)}>{"Войдите в свой аккаунт"}</p>
						</div>
						<div className={style.block}>
							<InputText id="email"
								name="email"
								required={true}
								autoFocus={true}
								autoComplete="email"
								placeholder="Имя пользователя"
								onChange={onLoginChange}
								value={login || ''}
								label="Username"
								error={authError}
							/>
							<Button
								onClick={handleOfflineAuth}
								className={buildClassName("filled", "colorBrand")}
								isLoading={authIsLoading && auth_state != 'handleCode'}
								disabled={authIsLoading || !canSubmit}
							>{"Войти"}</Button>
							<Button
								onClick={handleTJMCIDAuth}
								isLoading={authIsLoading && auth_state == 'handleCode'}
								disabled={authIsLoading}
								className={buildClassName("filled")}
							>{"TJMC ID"}</Button>
						</div>
					</div>
				</div>
			</div>
		</Fragment>
	);

};

const AuthContainer = ({ isShown }) => {
	const {
		shouldRender,
		transitionClassNames,
	} = useShowTransition(
		isShown, undefined, true, undefined, false, { }, 350
	);

	return shouldRender && (
		<div className={buildClassName(style.container, transitionClassNames)}>
			<Authentication />
		</div>
	);
}

export default memo(AuthContainer);