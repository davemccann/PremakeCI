const core = require('@actions/core');
const github = require('@actions/github');
const tc = require('@actions/tool-cache');
const toolchain = require('./toolchain');
const path = require('path');
const RunnerConfig = require('./runner-config');

function getInputStr(inputValue) {
	if (!inputValue) {
		return 'not defined'
	}
	return inputValue
}

function getPlatformString() {
	if (process.platform === 'win32') {
		return 'windows';
	}
	else if (process.platform === 'darwin') {
		return 'macosx';
	}
	else if (process.platform === 'linux') {
		return 'linux';
	}
	else {
		console.Error('unsupported platform');
	}
	return ''
}

function getPlatformArchiveExt() {
	if (process.platform === 'win32') {
		return 'zip';
	}
	else if (process.platform === 'darwin' || process.platform === 'linux') {
		return 'tar.gz';
	}
	else {
		console.Error('unsupported platform');
	}
	return ''
}

function main() {
	(async() => {
		try {
			cfg = RunnerConfig.create(
				core.getInput('version', {required: true}),	
				core.getInput('action', {required: true}), 
				core.getInput('options', {required: false}), 
				core.getInput('installPath', {required: false}),
				core.getInput('premakeFilepath', {required: false}));
			cfg.printRunnerConfig();

			const platform = getPlatformString();
			const archiveExt = getPlatformArchiveExt();

			const baseURL = `https://github.com/premake/premake-core/releases/download`;
			const premakeURL = path.join(baseURL, `v${version}/premake-${version}-${platform}.${archiveExt}`);

			// Add this path to the environment for this run
			core.addPath(installPath);

			// Attempt to download binary with the version specified
			const premakePath = await tc.downloadTool(premakeURL);

			// Extract the executable from the archive
			await toolchain.extractArchive(premakePath, installPath);

			// Execute premake and pass in the specified arguments
			var args = [ action ];
			if (cfg.premakeFilepath !== '') {
				args.push(`--file=${cfg.premakeFilepath}`)
			}
			if (options !== '') {
				args.push(options);
			}

			await toolchain.execApp(`premake5`, args);

		} catch (error) {
			console.error(`action failed: ${error.message}`);
		}
	})();
}

main();

