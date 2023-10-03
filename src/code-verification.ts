import OpenAI, { ClientOptions } from "openai";
import * as vscode from 'vscode';
import { Settings } from "./settings";
import { ChatCompletionCreateParamsNonStreaming } from "openai/resources/chat";
import { ResponseView } from "./response-view";

export class CodeVerification {
    constructor(private settings: Settings) {
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

        const apiKey = this.settings.openAiApiKey;
        if (!apiKey) {
            vscode.window.showErrorMessage("You need to configure your OpenAI API Key before use this extension functionalities");
            return;
        }

        const clientOptions: ClientOptions = {
            apiKey,
        };
        const openai = new OpenAI(clientOptions);

        const body: ChatCompletionCreateParamsNonStreaming = {
            model: 'gpt-3.5-turbo',
            temperature: 0,
            messages: [
                {
                    role: "system",
                    content: "You will be provided with a piece of code, and your task is to find and fix bugs in it. Wrap only if the provided code need to fix, and put your code examples between <code></code> tags. Don't include any explanations in your responses. "
                },
                {
                    role: "user",
                    content: `I'm writing a code with ${language} language and I need your help. Do I have a bug?`
                },
                {
                    role: "assistant",
                    content: text
                }
            ],
            max_tokens: 1024
        };
        try {
            vscode.window.withProgress({
                location: vscode.ProgressLocation.Window,
                cancellable: false,
                title: 'Checking if your code has a bug...'
            }, async (progress) => {

                progress.report({ increment: 0 });

                const response = await openai.chat.completions.create(body);
                const content = response.choices[0].message;
                if (content) {
                    const panel = new ResponseView(language ?? '');
                    panel.render(content);
                }
                progress.report({ increment: 100 });
            });

        } catch (err) {
            vscode.window.showErrorMessage(`Failed to get api response: ${err}`);
        }
    }

}