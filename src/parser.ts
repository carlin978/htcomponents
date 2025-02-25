import readline from 'node:readline/promises';
import fs from 'node:fs/promises';
import path from 'node:path';
import { EOL } from 'node:os';

import { Config } from './config.ts';

/**
 * Regex for matching and capturing a component.
 * The first capture group is the amount of times to repeat the component.
 * The second capture group is the name of the component.
 */
export const COMPONENT_TAG = /<@(?:(?<count>\d+):)?(?<component>[a-zA-Z][\w_-]*(?:\/[a-zA-Z][\w_-]*)*)@>/;

export async function parseLine(line: string, config: Config): Promise<string> {
	const component = COMPONENT_TAG.exec(line);
	if (component === null) {
		return line;
	}

	const count = parseInt(component.groups!['count']) || 1;
	const name = component.groups!['name'];

	if (count >= 100) {
		throw new RangeError('Component repeat count must be smaller than 100');
	}

	const findFileName = async (dir: string, name: string) => {
		const files = await fs.readdir(dir);
		for (const file of files) {
			const extension = config.acceptedExtensions.find(ext => file === `${name}.${ext}`);
			if (extension) {
				return `${name}.${extension}`;
			}
		}
	};

	return '';
}

export async function parseFile(config: Config, file: string) {
	const srcFile = await fs.open(path.join(config.srcDir, file));
	const outFile = await fs.open(path.join(config.outDir, file));

	const inputStream = readline.createInterface(srcFile.createReadStream({ encoding: 'utf8' }));
	const outputStream = outFile.createWriteStream({ encoding: 'utf8' });

	for await (const line of inputStream) {
	}
	outputStream.end();
	inputStream.close();
}
