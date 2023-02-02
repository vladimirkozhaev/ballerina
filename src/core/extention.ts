import path = require("path");
import * as vscode from "vscode";



import {
  LanguageClient,
  LanguageClientOptions,
  RevealOutputChannelOn,
  ServerOptions,
  State,
} from "vscode-languageclient/node";

const outputChannel = vscode.window.createOutputChannel("Ballerina");
const LS_LAUNCHER_MAIN: string = "BallerinaLanguageServerLauncher";

export class BallerinaExtension {
  private languageClient?: LanguageClient;
  private context?: vscode.ExtensionContext;

  setContext(context: vscode.ExtensionContext) {
    this.context = context;
  }

  async init(): Promise<void> {
    try {
      //Server options. LS client will use these options to start the LS.
      let serverOptions: ServerOptions = getServerOptions(this.context as vscode.ExtensionContext);

      //creating the language client.
      let clientId = "ballerina-vscode-lsclient";
      let clientName = "Ballerina LS Cli  ent";
      let clientOptions: LanguageClientOptions = {
        documentSelector: [{ scheme: "file", language: "ballerina" }],
        outputChannel: outputChannel,
        revealOutputChannelOn: RevealOutputChannelOn.Never,
      };
      this.languageClient = new LanguageClient(
        clientId,
        clientName,
        serverOptions,
        clientOptions
      );

      const disposeDidChange = this.languageClient.onDidChangeState(
        (stateChangeEvent) => {
          if (stateChangeEvent.newState === State.Stopped) {
            vscode.window.showErrorMessage(
              "Failed to initialize the extension"
            );
          } else if (stateChangeEvent.newState === State.Running) {
            vscode.window.showInformationMessage(
              "Extension initialized successfully!"
            );
          }
        }
      );

      let disposable = this.languageClient.start();
      
    } catch (exception) {
      return Promise.reject("Extension error!");
    }
  }
}

//Create a command to be run to start the LS java process.
function getServerOptions(context: vscode.ExtensionContext) {
  //Change the project home accordingly.
 
  //const LS_HOME = path.join('C:','Users','vkozh','Documents','projects','ballerina-language-client','ballerina','jars','lang-server-0.0.1-SNAPSHOT-jar-with-dependencies.jar');
  const LS_HOME =  path.resolve(context.extensionPath,'jars','lang-server-0.0.1-SNAPSHOT-jar-with-dependencies.jar');
  const JAVA_HOME = process.env.JAVA_HOME;
 
  let executable: string = path.join(String(JAVA_HOME), "bin", "java");
  let args: string[] = ["-jar", LS_HOME];

  let serverOptions: ServerOptions = {
    command: executable,
    args: [...args, LS_LAUNCHER_MAIN],
    options: {},
  };
  return serverOptions;
}

export const extensionInstance = new BallerinaExtension();