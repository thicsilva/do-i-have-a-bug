import { workspace, window, Event, EventEmitter } from 'vscode';

export enum ChatModel {
    gpt3='gpt-3.5-turbo',
    gpt4='gpt-4'
}

export function chatModelFromString(value:string){
    switch (value){
        case 'gpt-4': return ChatModel.gpt4;
        default:return ChatModel.gpt3;        
    }        
}

export class Settings {
    private _openAiApiKey: string;
    private _openAiChatModel: string;
    private static _instance: Settings;
    private readonly configurationUpdateEventEmitter = new EventEmitter<void>();

    public static get getInstance(): Settings {
        if (!this._instance) {
            this._instance = new Settings();
        }

        return this._instance;
    }

    public get openAiApiKey() {
        return this._openAiApiKey;
    }

    public get openAiChatModel(){
        return this._openAiChatModel;
    }

    private constructor() {

        workspace.onDidChangeConfiguration(() => {
            this.initializeSettings();
            this.configurationUpdateEventEmitter.fire();
        });

        window.onDidChangeActiveTextEditor(e => {
            if (e) {
                this.initializeSettings();
                this.configurationUpdateEventEmitter.fire();
            }
        });

        this.initializeSettings();
    }

    private initializeSettings() {
        const document = window.activeTextEditor?.document;
        const settings = workspace.getConfiguration('do-i-have-a-bug', document?.uri);
        this._openAiApiKey = settings.get<string>("openAiApiKey", "");
        this._openAiChatModel = settings.get<string>("openAiChatModel", 'gpt-3.5-turbo');
    }

    public get onDidChangeConfiguration(): Event<void> {
        return this.configurationUpdateEventEmitter.event;
    }
}