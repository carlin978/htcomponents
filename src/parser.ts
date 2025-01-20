import readline from 'node:readline/promises';
import fs from 'node:fs/promises';
import path from 'node:path';
import { EOL } from 'node:os';
import { Config } from './index.ts';

/**
 * Regex for matching and capturing a component.
 * The first capture group is the amount of times to repeat the component.
 * The second capture group is the name of the component.
 */
export const COMPONENT_TAG = /<@(?:(\d+):)?([a-zA-Z][\w_-]*(?:\/[a-zA-Z][\w_-]*)*)@>/;

export async function parse(config: Config, file: string) {
	const srcFile = await fs.open(path.join(config.srcDir, file));
	const outFile = await fs.open(path.join(config.outDir, file));

	const inputStream = readline.createInterface(srcFile.createReadStream({ encoding: 'utf8' }));
	const outputStream = outFile.createWriteStream({ encoding: 'utf8' });

	for await (const line of inputStream) {
		const component = COMPONENT_TAG.exec(line);
		if (component === null) {
			outputStream.write(line + EOL);
			continue;
		}

		const count = parseInt(component[1] ?? '1');

		const name = component[2];
	}
	outputStream.end();
	inputStream.close();
}
