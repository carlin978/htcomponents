import fs from 'node:fs/promises';
import path from 'node:path';

export const CONFIG_FILE = 'htcomponents.json';
export const ACCEPTED_EXTENSIONS = Object.freeze(['html', 'htm'] as const);

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
	acceptedExtensions: string[];

	static readonly dirKeys = Object.freeze(['srcDir', 'outDir', 'componentDir'] as const);

	static absolutifyPath(configPath: string): string {
		return path.isAbsolute(configPath) ? configPath : path.join(process.cwd(), configPath);
	}

	constructor(srcDir: string, outDir: string, componentDir: string, additionalExtensions: string[] = []) {
		this.srcDir = Config.absolutifyPath(srcDir);
		this.outDir = Config.absolutifyPath(outDir);
		this.componentDir = Config.absolutifyPath(componentDir);
		this.acceptedExtensions = [...ACCEPTED_EXTENSIONS, ...additionalExtensions];
	}

	static async load(): Promise<Config> {
		let file = await fs.readFile(path.join(process.cwd(), CONFIG_FILE), { encoding: 'utf8' });

		let parsedConfig = JSON.parse(file);

		if (this.isValidJson(parsedConfig)) {
			return new Config(parsedConfig.srcDir, parsedConfig.outDir, parsedConfig.componentDir, parsedConfig.additionalExtensions);
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
