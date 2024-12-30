import { ensureDirs, loadConfig, recreateFileStructure } from "./index.ts";

try {
	let config = await loadConfig();
	await ensureDirs(config);
	await recreateFileStructure(config);

	console.log(JSON.stringify(config));
} catch (e) {
	console.error(e);
}
