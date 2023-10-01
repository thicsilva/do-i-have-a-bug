import * as vscode from 'vscode';
export class Settings {
    openAiApiKey:string="";
}

function getSetting<TSetting>(key: string | undefined, value: TSetting, configuration: vscode.WorkspaceConfiguration): TSetting {
    
    if (key !== undefined && !(value instanceof Settings)) {
        return configuration.get<TSetting>(key, value);
    }
    
    for (const property in value) {
        const subKey = key !== undefined ? `${key}.${property}` : property;
        value[property] = getSetting(subKey, value[property], configuration);
    }

    return value;
}

export function getSettings(): Settings {
    const configuration: vscode.WorkspaceConfiguration =
        vscode.workspace.getConfiguration('DoIHaveABug');

    return getSetting(undefined, new Settings(), configuration);
}