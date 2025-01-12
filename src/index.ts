import fs from 'node:fs/promises';
import path from 'node:path';

export const CONFIG_FILE = 'htcomponents.json';
export const ACCEPTED_EXTENSIONS = Object.freeze(['html']);

export interface ConfigJson {
	srcDir: string;
	outDir: string;
	componentDir: string;
	additionalExtensions?: string[];
}

export class Config {
	srcDir: string;
	outDir: string;
	componentDir: string;
	additionalExtensions: string[];

	static readonly dirKeys = Object.freeze(['srcDir', 'outDir', 'componentDir']);

	static absolutifyPath(configPath: string): string {
		return path.isAbsolute(configPath) ? configPath : path.join(process.cwd(), configPath);
	}

	constructor(srcDir: string, outDir: string, componentDir: string, additionalExtensions: string[] = []) {
		this.srcDir = Config.absolutifyPath(srcDir);
		this.outDir = Config.absolutifyPath(outDir);
		this.componentDir = Config.absolutifyPath(componentDir);
		this.additionalExtensions = [...ACCEPTED_EXTENSIONS, ...additionalExtensions];
	}

	static async load(): Promise<Config> {
		let file = await fs.readFile(path.join(process.cwd(), CONFIG_FILE), { encoding: 'utf8' });

		let parsedConfig = JSON.parse(file);

		if (this.isValidJson(parsedConfig)) {
			return new Config(parsedConfig.srcDir, parsedConfig.outDir, parsedConfig.componentDir);
		} else {
			throw new TypeError('Invalid Config');
		}
	}

	static isValidJson(config: any): config is ConfigJson {
		return (
			typeof config === 'object' &&
			this.dirKeys.every(key => key in config && typeof config[key] === 'string') &&
			(!('additionalExtensions' in config) ||
				(Array.isArray(config['additionalExtensions']) && config['additionalExtensions'].every(ext => typeof ext === 'string')))
		);
	}
}

const fileExists = async (path: string) => !!(await fs.stat(path).catch(e => false));

const checkFileAccess = async (path: string, access: number) => !(await fs.access(path, access).catch(e => true));

export async function ensureDirs(config: Config) {
	for (let i = 0; i < Config.dirKeys.length; i++) {
		const key = Config.dirKeys[i] as keyof Config;
		const dir = config[key] as string;

		if (await fileExists(dir)) {
			const access = i === 0 ? fs.constants.R_OK : fs.constants.R_OK | fs.constants.W_OK;

			if (!(await checkFileAccess(dir, access))) {
				throw new Error(`No Access to ${key}`);
			}
		} else {
			fs.mkdir(dir, { recursive: true });
		}
	}
}

async function fileMapper(file: string, fn: (file: string, srcDir: string) => Promise<void>, srcDir: string) {
	const filePath = path.join(srcDir, file);
	const fileStats = await fs.lstat(filePath);
	if (fileStats.isDirectory()) {
		const dirContents = await fs.readdir(filePath);
		for (const f of dirContents) {
			await fileMapper(f, fn, path.join(srcDir, file));
		}
	} else {
		await fn(file, srcDir);
	}
}

export async function recreateFileStructure(config: Config) {
	let srcDirContents = await fs.readdir(config.srcDir);
	for (const file of srcDirContents) {
		await fileMapper(
			file,
			async (file, srcDir) => {
				const pathSrc = path.relative(config.srcDir, srcDir);
				const pathOut = path.join(config.outDir, pathSrc);
				if (!(await fileExists(pathOut))) {
					await fs.mkdir(pathOut, { recursive: true });
				}

				await fs.writeFile(path.join(pathOut, file), '', { encoding: 'utf8' });
			},
			config.srcDir
		);
	}
}
