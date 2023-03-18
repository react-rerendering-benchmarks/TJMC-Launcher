// Modules import
declare module '*.module.css';
declare module "*.png";
declare module "*.jpeg";
declare module "*.svg";
// Webpack Define
declare const APP_NAME: string;
declare const APP_ENV: "development" | "production";
declare const APP_VERSION: string;
declare const APP_COPYRIGHT: string;
declare const AUTHOR: string;
declare const HTML_TIMESTAMP: string;
declare const API_URL: string;

interface TJMCSystem {
	os: 'linux' | 'osx' | 'windows' | 'web'
};

interface TJMCNative {
	window: {
		close: Function;
		maximize: Function;
		minimize: Function;
		fullscreen: Function;
	};
	versions: Object;
};

interface Window {
	GLOBAL_ENV: any;
	buildInfo: any;
	__debug__: boolean;
	__debug_host__: boolean;
	__debug_api__: boolean;
	__STANDALONE__: boolean;
	system: TJMCSystem;
	tjmcNative: TJMCNative;
};