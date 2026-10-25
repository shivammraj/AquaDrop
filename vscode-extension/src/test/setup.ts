// Setup mock for 'vscode' module when running tests outside VS Code Extension Host
const Module = require('node:module')

export const mockVscode = {
  commands: {
    registered: new Map<string, (...args: any[]) => any>(),
    registerCommand(command: string, handler: (...args: any[]) => any) {
      this.registered.set(command, handler)
      return {
        dispose: () => {
          this.registered.delete(command)
        }
      }
    },
    async executeCommand(command: string, ...args: any[]) {
      const handler = this.registered.get(command)
      if (handler) {
        return handler(...args)
      }
      return undefined
    }
  },
  window: {
    createStatusBarItem: () => ({
      show: () => {},
      hide: () => {},
      dispose: () => {},
      text: '',
      tooltip: '',
      command: ''
    }),
    showInformationMessage: async (...args: any[]) => undefined,
    showWarningMessage: async (...args: any[]) => undefined,
    showQuickPick: async (...args: any[]) => undefined,
    showInputBox: async (...args: any[]) => undefined,
    createOutputChannel: (name: string) => ({
      name,
      append: () => {},
      appendLine: () => {},
      clear: () => {},
      show: () => {},
      hide: () => {},
      dispose: () => {}
    }),
    createWebviewPanel: () => ({
      visible: true,
      reveal: () => {},
      dispose: () => {},
      onDidDispose: () => ({ dispose: () => {} }),
      webview: {
        html: '',
        onDidReceiveMessage: () => ({ dispose: () => {} }),
        postMessage: async () => true
      }
    }),
    registerWebviewViewProvider: () => ({ dispose: () => {} })
  },
  workspace: {
    configStore: new Map<string, any>(),
    getConfiguration: (section?: string) => ({
      get: (key: string, defaultValue?: any) => {
        const fullKey = section ? `${section}.${key}` : key
        if (mockVscode.workspace.configStore.has(fullKey)) {
          return mockVscode.workspace.configStore.get(fullKey)
        }
        return defaultValue
      },
      update: async (key: string, value: any) => {
        const fullKey = section ? `${section}.${key}` : key
        mockVscode.workspace.configStore.set(fullKey, value)
      }
    }),
    onDidChangeConfiguration: () => ({ dispose: () => {} })
  },
  StatusBarAlignment: { Left: 1, Right: 2 },
  ViewColumn: { One: 1, Two: 2, Active: -1 },
  ConfigurationTarget: { Global: 1, Workspace: 2 }
}

const originalResolve = (Module as any)._resolveFilename
;(Module as any)._resolveFilename = function (request: string, parent: any, isMain: boolean, options: any) {
  if (request === 'vscode') {
    return 'vscode'
  }
  return originalResolve.call(this, request, parent, isMain, options)
}

require.cache['vscode'] = {
  id: 'vscode',
  filename: 'vscode',
  loaded: true,
  exports: mockVscode
} as any
