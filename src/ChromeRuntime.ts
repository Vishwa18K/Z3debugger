import { spawnWithWebSocket } from "chrome-debugging-client";
import { EventEmitter } from "events";

export class ChromeRuntime extends EventEmitter {
  private node: any;
  private connection: any;
  private scriptId: string | null = null;

  async launch(scriptCode: string) {
    this.node = await spawnWithWebSocket(process.execPath, [
      "--inspect-brk=0",
      "-e",
      scriptCode,
    ]);

    this.connection = this.node.connection;

    await Promise.all([
      this.connection.send("Debugger.enable"),
      this.connection.send("Runtime.enable"),
      this.connection.send("Runtime.runIfWaitingForDebugger"),
    ]);

    const pauseEvent = await this.connection.until("Debugger.paused");
    this.scriptId = pauseEvent.callFrames[0].location.scriptId;

    this.emit("stopOnEntry");

    // Listen for subsequent pause events (e.g. hitting breakpoints)
    this.connection.on("Debugger.paused", (event: {
      reason: string;
      callFrames: Array<{
        callFrameId: string;
        functionName: string;
        location: {
          scriptId: string;
          lineNumber: number;
          columnNumber: number;
        };
        scopeChain: any[];
        this: any;
      }>;
    }) => {
      this.emit("stopOnBreakpoint");
    });
  }

  async setBreakPoint(line: number) {
    if (!this.scriptId) throw new Error("No scriptId available yet");

    const { breakpointId, actualLocation } = await this.connection.send("Debugger.setBreakpoint", {
      location: {
        scriptId: this.scriptId,
        lineNumber: line - 1,
        columnNumber: 0,
      },
    });

    return {
      verified: true,
      line: actualLocation.lineNumber,
      id: parseInt(breakpointId.replace("breakpoint:", "")) || line,
    };
  }

  async resume() {
    await this.connection.send("Debugger.resume");
  }

  dispose() {
    if (this.node) {
      this.node.dispose();
    }
  }
}