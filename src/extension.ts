// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import { ExtensionContext, commands, } from 'vscode';
import { Settings } from './settings';
import { CodeVerification } from './code-verification';




// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export async function activate(context: ExtensionContext) {

	const codeVerification = new CodeVerification(new Settings());

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "do-i-have-a-bug" is now active!');
	// console.log(response.choices[0].text);

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json

	let checkFile = commands.registerCommand('do-i-have-a-bug.checkFile', async () => {

		await codeVerification.executeOnFile();
	});

	let checkSelectedCode = commands.registerCommand('do-i-have-a-bug.checkSelectedCode', async () => {
		await codeVerification.executeOnSelection();

	});

	context.subscriptions.push(checkFile, checkSelectedCode);
}

// This method is called when your extension is deactivated
export function deactivate() { }
