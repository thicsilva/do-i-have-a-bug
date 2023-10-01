import OpenAI, { ClientOptions } from "openai";
import * as vscode from 'vscode';
import { CompletionCreateParamsNonStreaming } from "openai/resources";
import { Settings } from "./settings";
import { ChatCompletionCreateParamsNonStreaming } from "openai/resources/chat";

export class CodeVerification {
    constructor(private settings: Settings) {
    }

    async execute(): Promise<void> {
        const apiKey  = this.settings.openAiApiKey;
        
        if (!apiKey) {
            vscode.window.showErrorMessage("You need to configure your OpenAI API Key before use this extension functionalities");
            return;
        }

        console.log(vscode.window.activeTextEditor?.document.getText());
        const document = vscode.window.activeTextEditor?.document;
        const text = document?.getText();
        const language = document?.languageId;

        if (!text || !text.trim()) {
            vscode.window.showErrorMessage('Empty string is not allowed to use in the context.');
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
            const response = await openai.chat.completions.create(body);
            const content = this.formatCode(response.choices[0].message.content);
            if (content) {
                const panel = vscode.window.createOutputChannel('Do I Have A Bug?', language);
                panel.append(content);
                panel.show();
            }

        } catch (err) {
            vscode.window.showErrorMessage(`Failed to get api response: ${err}`);
        }
    }

    private formatCode(content: string | null): string {
        if (!content) {
            return '';
        }

        const reg = /`{3,}(\w+)?/g;
        const splited = content.split(reg);
        for (let i=0;i<splited.length;i++){
            if (splited[i]===undefined)
                {
                    return splited[i-1];
                }
        }

        return '';
    }

}