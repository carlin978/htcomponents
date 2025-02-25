import fs from 'node:fs/promises';
import path from 'node:path';
import { Config } from './config.ts';
import * as parser from './parser.ts';

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

				if (config.acceptedExtensions.includes(path.extname(file).slice(1))) {
					await parser.parseFile(config, path.join(pathSrc, file));
				}
			},
			config.srcDir
		);
	}
}

export * as parser from './parser.ts';
export * from './config.ts';
