import {
    CloseAction,
    createConnection,
    ErrorAction,
    MonacoLanguageClient,
    MonacoServices,
} from 'monaco-languageclient';
import { listen, MessageConnection } from 'vscode-ws-jsonrpc';
import { editor } from 'monaco-editor';

function createLanguageClient(connection: MessageConnection) {
    return new MonacoLanguageClient({
        name: 'pyls client',
        clientOptions: {
            documentSelector: ['python'],
            errorHandler: {
                error: () => ErrorAction.Continue,
                // when we close the WebSocket (primarily through webSocket.close()) make sure to stop pyls
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

type DisposeFunction = () => void;
export default function connectToLanguageServer(): undefined | DisposeFunction {
    if (!process.env.REACT_APP_LSP) {
        return;
    }

    try {
        MonacoServices.get();
    } catch (e) {
        MonacoServices.install(editor);
    }

    const webSocket = new WebSocket(process.env.REACT_APP_LSP);
    webSocket.onerror = () => {};
    listen({
        webSocket,
        onConnection: (connection) => {
            const client = createLanguageClient(connection);
            const disposable = client.start();
            connection.onClose(() => disposable.dispose());
            connection.onError(() => {});
        },
    });

    return () => {
        try {
            webSocket.close();
        } catch (e) {}
    };
}
