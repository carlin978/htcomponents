import fs from "node:fs/promises";
import path from "node:path";

export interface Config extends Record<string, string> {
	srcDir: string,
	outDir: string,
	componentDir: string
}

export const configKeys = Object.freeze([
	"srcDir",
	"outDir",
	"componentDir"
]);

/**
 * Checks validity of Config
 */
function isValidConfig(config: any): config is Config {
	return typeof config === "object" && configKeys.every(key => key in config && typeof config[key] === "string");
}

export async function loadConfig(): Promise<Config> {
	let filePath = path.join(process.cwd(), "htcomponents.json");

	let file = await fs.readFile(filePath, { encoding: "utf8" });
	let parsedConfig = JSON.parse(file);
	if (isValidConfig(parsedConfig)) {
		let config: Record<string, string> = {};
		configKeys.forEach(key => {
			config[key] = path.isAbsolute(parsedConfig[key]) ? parsedConfig[key] : path.join(process.cwd(), parsedConfig[key]);
		});
		return config as Config;
	} else {
		throw new TypeError("Invalid Config");
	}
}

/**
 * Check if file exists
 */
const fileExists = async (path: string) => !!(await fs.stat(path).catch(e => false));

/**
 * Check file access
 */
const checkFileAccess = async (path: string, access: number) => !(await fs.access(path, access).catch(e => true));

export async function ensureDirs(config: Config) {
	for (let i = 0; i < configKeys.length; i++) {
		const key = configKeys[i];
		if (await fileExists(config[key])) {
			const access = i === 0 ? fs.constants.R_OK : fs.constants.R_OK | fs.constants.W_OK;
			if (!await checkFileAccess(config[key], access)) {
				throw new Error(`No Access to ${key}`);
			}
		} else {
			fs.mkdir(config[key], { recursive: true });
		}
	}
}

async function fileMapper(file: string, fn: (file: string, srcDir: string) => void, srcDir: string) {
	const filePath = path.join(srcDir, file);
	const fileStats = await fs.lstat(filePath);
	if (fileStats.isDirectory()) {
		const dirContents = await fs.readdir(filePath);
		for (const f of dirContents) {
			await fileMapper(f, fn, path.join(srcDir, file));
		}
	} else {
		fn(file, srcDir);
	}
}

export async function recreateFileStructure(config: Config) {
	let srcDirContents = await fs.readdir(config.srcDir);
	for (const file of srcDirContents) {
		await fileMapper(
			file,
			(file, srcDir) => {
				console.log(path.join(srcDir, file));
			},
			config.srcDir
		);
	}
}
