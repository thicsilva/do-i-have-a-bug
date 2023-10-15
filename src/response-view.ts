import { ChatCompletionMessage } from "openai/resources/chat";
import { Position, Range, TextDocument, ViewColumn, languages, window, workspace } from "vscode";

export class ResponseView {
    protected readonly documents: TextDocument[] = [];

    public constructor(private _language: string) {
        workspace.onDidCloseTextDocument(e => {
            const index = this.documents.indexOf(e);
            if (index !== -1) {
                this.documents.splice(index, 1);
            }
        });
    }

    public async render(response: ChatCompletionMessage, column?: ViewColumn) {
        const content = this.getTextFromResponse(response);
        if (content) {
            let document: TextDocument;

            if (this.documents.length === 0) {
                document = await workspace.openTextDocument({ content, language: this._language });
                await window.showTextDocument(document, { viewColumn: column, preview: true });
            } else {
                document = this.documents[this.documents.length - 1];
                languages.setTextDocumentLanguage(document, this._language);
                const editor = await window.showTextDocument(document, { viewColumn: column, preview: true });
                editor.edit(edit => {
                    const startPos = new Position(0, 0);
                    const endPos = document.lineAt(document.lineCount - 1).range.end;
                    edit.replace(new Range(startPos, endPos), content);
                });
            }
        }
        const panel = window.createOutputChannel('Do I Have a Bug? Complete Response');
        panel.append(response.content ?? '');
        panel.show();

    }
    private getTextFromResponse(response: ChatCompletionMessage) {
        const content = response?.content;
        if (content) {
            if (content.indexOf("<code>") > -1) {
                return this.getTextFromTagsResponse(content);
            }

            return this.getTextFromQuotesResponse(content);
        }

        return '';
    }

    private getTextFromQuotesResponse(response: string): string {
        const codeReg = /`{3}([\s\S]+?)`{3}/gim;
        const text = codeReg.exec(response);
        if (text) {
            let result = text[text.length - 1];
            result = result.replace(result.substring(0, result.indexOf("\n")), "");
            return result;
        }
        return '';
    }

    private getTextFromTagsResponse(response: string): string {
        const codeReg = /<code>([\s\S]+?)<\/code>/gim;
        const text = codeReg.exec(response);
        if (text) {
            return text[text.length - 1];
        }
        return '';
    }
}