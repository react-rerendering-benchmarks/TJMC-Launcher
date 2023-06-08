import { memo, createElement, Fragment, useCallback, useEffect, useRef } from "react";

import buildClassName from "Util/buildClassName";
import { getDispatch } from "Store/Global";
import useGlobal from "Hooks/useGlobal";
import { selectCurrentVersionHash, selectInstallations, selectInstances } from "Model/Selectors/installations";

import { SVG } from "UI/svg";
import CubeSidebarItem from "./CubeSidebarItem";
import InstanceItem from "./InstanceItem";


const CubeSidebarItems = memo(() => {
	const installations = useGlobal(global => Object.keys(selectInstallations(global)));
	const currentHash = useGlobal(selectCurrentVersionHash);

	const dragItem = useRef(undefined);
	const dragOverItem = useRef(undefined);

	const handleDragStart = (hash) => {
		dragItem.current = hash;
	};

	const handleDragOver = (hash) => {
		dragOverItem.current = hash;
	};

	const handleDragEnd = () => {

		console.debug("[drag]", dragItem.current, ">>", dragOverItem.current);

		dragItem.current = undefined;
		dragOverItem.current = undefined;
	};

	return installations.length ? (
		installations.map((hash) => (
			<CubeSidebarItem
				key={hash}
				hash={hash}
				isSelected={currentHash == hash}
				onDragStart={() => handleDragStart(hash)}
				onDragOver={() => handleDragOver(hash)}
				onDragEnd={handleDragEnd}
			/>
		))
	) : (
		<div className={buildClassName('item', "d-flex", "centred", 'fp')}>
			<h1>{'Добавьте версию'}</h1>
		</div>
	);
});

const InstallationsScroller = memo(() => {
	const { openVersionChooserModal } = getDispatch();
	const onClick = () => openVersionChooserModal();
	return (
		<div className={buildClassName('scroller', 'thin-s')}>
			<h2 className={buildClassName('header-w', 'container-df')}>
				<span>{"Версии"}</span>
				<div className={buildClassName("button", "small")} onClick={onClick}>{SVG('add-plus')}</div>
			</h2>
			<CubeSidebarItems />
		</div>
	);
});

const InstanceScroller = memo(() => {
	const { killAllInstances, alert } = getDispatch();
	const instances = useGlobal(global => Object.keys(selectInstances(global)));
	const handleKillAll = useCallback(() => {
		alert({
			title: "Остановить всё",
			content: `Вы действительно хотите остановить все запущенные версии?`,
			type: "error",
			buttons: [
				{
					name: "Отмена",
					closeOverlay: true,
				},
				{
					name: "Остановить",
					class: ["filled", "colorRed"],
					closeOverlay: true,
					callback: () => {
						killAllInstances();
					}
				}
			],
			mini: true,
		});
	}, [killAllInstances, alert]);
	return instances.length > 0 && (
		<div className={buildClassName('scroller', 'thin-s')}>
			<h2 className={buildClassName('header-w', 'container-df')}>
				<span>{"Запущенные"}</span>
				<div className={buildClassName("button", "small")} onClick={handleKillAll} title="Kill all instances">{SVG('cross')}</div>
			</h2>
			{instances.map((instanceId) =>
				<InstanceItem
					key={instanceId}
					instanceId={instanceId}
				/>)}
		</div>
	);
});

const CubeSidebar = () => {
	return (
		<Fragment>
			<InstallationsScroller />
			<InstanceScroller />
		</Fragment>
	);
};

export default memo(CubeSidebar);