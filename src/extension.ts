import { ExtensionContext, commands, } from 'vscode';
import { CodeVerification } from './code-verification';

export async function activate(context: ExtensionContext) {

	const codeVerification = new CodeVerification();
	let checkFile = commands.registerCommand('do-i-have-a-bug.checkFile', async () => {

		await codeVerification.executeOnFile();
	});

	let checkSelectedCode = commands.registerCommand('do-i-have-a-bug.checkSelectedCode', async () => {
		await codeVerification.executeOnSelection();

	});

	context.subscriptions.push(checkFile, checkSelectedCode);
}

export function deactivate() { }
