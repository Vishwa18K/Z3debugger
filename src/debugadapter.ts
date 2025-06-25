import {
  Logger,
  LoggingDebugSession,
  InitializedEvent,
  StoppedEvent,
  TerminatedEvent,
  OutputEvent,
  Breakpoint,
  BreakpointEvent
} from '@vscode/debugadapter';

import { DebugProtocol } from '@vscode/debugprotocol';
import * as fs from 'fs';
import { ChromeRuntime } from './ChromeRuntime';

interface LaunchRequestArguments extends DebugProtocol.LaunchRequestArguments {
  program: string;
}

class MyDebugSession extends LoggingDebugSession {
  private _runtime: ChromeRuntime;
  static threadID = 1;

  public constructor() {
    super("my-debugger.log");
    this._runtime = new ChromeRuntime();
    
    this._runtime.on('stopOnBreakpoint', () => {
      this.sendEvent(new StoppedEvent('breakpoint', MyDebugSession.threadID));
    });

    this._runtime.on('stopOnEntry', () => {
      this.sendEvent(new StoppedEvent('entry', MyDebugSession.threadID));
    });
  }
  


  protected async launchRequest(
    response: DebugProtocol.LaunchResponse,
    args: LaunchRequestArguments
  ): Promise<void> {
    this.sendEvent(new InitializedEvent());
    const code = fs.readFileSync(args.program, 'utf8');
    await this._runtime.launch(code);
    this.sendResponse(response);
  }
    protected continueRequest(
    response: DebugProtocol.ContinueResponse,
    args: DebugProtocol.ContinueArguments
  ): void {
    this._runtime.resume().then(() => {
    this.sendResponse(response);
  });
};

  protected setBreakPointsRequest(
    response: DebugProtocol.SetBreakpointsResponse,
    args: DebugProtocol.SetBreakpointsArguments
  ): void {
    const breakpoints = args.breakpoints || [];
    const bpPromises = breakpoints.map(bp =>
      this._runtime.setBreakPoint(bp.line)
    );

  


    Promise.all(bpPromises).then(bps => {
      response.body = {
        breakpoints: bps.map(bp => ({
          verified: bp.verified,
          line: bp.line,
          id: bp.id
        })),
      };
      this.sendResponse(response);
    });
  }
}

MyDebugSession.run(MyDebugSession);