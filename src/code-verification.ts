import OpenAI, { ClientOptions } from "openai";
import * as vscode from 'vscode';
import { Settings } from "./settings";
import { ChatCompletionCreateParamsNonStreaming } from "openai/resources/chat";
import { ResponseView } from "./response-view";

export class CodeVerification {
    constructor() {
    }

    async executeOnFile() {
        const document = vscode.window.activeTextEditor?.document;
        const text = document?.getText();
        const language = document?.languageId;
        return await this.execute(text, language);
    }

    async executeOnSelection() {
        const document = vscode.window.activeTextEditor?.document;
        const selection = vscode.window.activeTextEditor?.selection;
        if (selection && !selection.isEmpty) {
            const text = document?.getText(new vscode.Range(selection.start, selection.end));
            const language = document?.languageId;
            this.execute(text, language);
        } else {
            vscode.window.showErrorMessage('Selection is empty');
        }
    }

    private async execute(text: string | undefined, language: string | undefined): Promise<void> {

        if (!text || !text.trim()) {
            vscode.window.showErrorMessage('Empty string is not allowed.');
            return;
        }

        const apiKey = Settings.getInstance.openAiApiKey;
        if (!apiKey) {
            vscode.window.showErrorMessage("You need to configure your OpenAI API Key before use this extension functionalities");
            return;
        }

        const clientOptions: ClientOptions = {
            apiKey,
        };
        const openai = new OpenAI(clientOptions);

        const body: ChatCompletionCreateParamsNonStreaming = {
            model: Settings.getInstance.openAiChatModel,
            temperature: 0,
            messages: [
                {
                    role: "system",
                    content: `You will be provided with a piece of code, and your task is to find and fix bugs in it. 
                    Please only respond if the code provided needs to be corrected, and enclose your code examples between <code></code> tags.`
                },
                {
                    role: "user",
                    content: `I'm writing a program in ${language} and I need your help. Do I have a bug in my code?`
                },
                {
                    role: "assistant",
                    content: `<code>${text}</code>`
                }
            ],
            // eslint-disable-next-line @typescript-eslint/naming-convention
            max_tokens: 1024,

        };
        try {
            vscode.window.withProgress({
                location: vscode.ProgressLocation.Window,
                cancellable: true,
                title: 'Checking if your code has a bug...'
            }, async (progress) => {

                try{
                    progress.report({ increment: 0 });

                    const response = await openai.chat.completions.create(body);
                    const content = response.choices[0].message;
                    if (content) {
                        const panel = new ResponseView(language ?? '');
                        panel.render(content);
                    }
                    progress.report({ increment: 100 });
                } catch(err){
                    vscode.window.showErrorMessage(`Failed to get api response: ${err}`);
                }
               
            });

        } catch (err) {
            vscode.window.showErrorMessage(`Failed to get api response: ${err}`);
        }
    }

}