import { ensureDirs, recreateFileStructure, Config } from "./index.ts";

try {
	let config = await Config.load();
	await ensureDirs(config);
	await recreateFileStructure(config);

	console.log(JSON.stringify(config));
} catch (e) {
	console.error(e);
}
