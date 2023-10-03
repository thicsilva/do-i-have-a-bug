import * as vscode from 'vscode';
export class Settings {
    private _openAiApiKey: string;
    private readonly configurationUpdateEventEmitter = new vscode.EventEmitter<void>();

    public constructor() {

        const settings = vscode.workspace.getConfiguration('do-i-have-a-bug', vscode.window.activeTextEditor?.document?.uri);
        this._openAiApiKey = settings.get<string>("openAiApiKey", "");

        vscode.workspace.onDidChangeConfiguration(() => {
            this.initializeSettings();
            this.configurationUpdateEventEmitter.fire();
        });

        vscode.window.onDidChangeActiveTextEditor(e => {
            if (e) {
                this.initializeSettings();
                this.configurationUpdateEventEmitter.fire();
            }
        });


    }

    private initializeSettings() {
        const settings = vscode.workspace.getConfiguration('do-i-have-a-bug', vscode.window.activeTextEditor?.document?.uri);
        this._openAiApiKey = settings.get<string>("openAiApiKey", "");
    }

    public get onDidChangeConfiguration(): vscode.Event<void> {
        return this.configurationUpdateEventEmitter.event;
    }

    public get openAiApiKey() {
        return this._openAiApiKey;
    }

}