import {
    CloseAction,
    createConnection,
    ErrorAction,
    MonacoLanguageClient,
    MonacoServices,
} from 'monaco-languageclient';
import {listen, MessageConnection} from 'vscode-ws-jsonrpc';
import { editor } from 'monaco-editor';

function createLanguageClient(connection: MessageConnection) {
    return new MonacoLanguageClient({
        name: 'pyls client',
        clientOptions: {
            documentSelector: ['python'],
            errorHandler: {
                error: () => ErrorAction.Continue,
                closed: () => CloseAction.DoNotRestart,
            }
        },
        connectionProvider: {
            get(errorHandler, closeHandler) {
                return Promise.resolve(createConnection(
                    connection,
                    errorHandler,
                    closeHandler,
                ));
            }
        }
    })
}

export default function connectToLanguageServer() {
    if (!process.env.REACT_APP_LSP) {
        return;
    }

    MonacoServices.install(editor);
    const webSocket = new WebSocket(process.env.REACT_APP_LSP);
    listen({
        webSocket,
        onConnection: (connection) => {
            const client = createLanguageClient(connection);
            const disposable = client.start();
            connection.onClose(() => disposable.dispose());
            connection.onError((e) => console.log(e));
        }
    });
}