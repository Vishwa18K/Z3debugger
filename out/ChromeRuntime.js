"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChromeRuntime = void 0;
const chrome_debugging_client_1 = require("chrome-debugging-client");
const events_1 = require("events");
class ChromeRuntime extends events_1.EventEmitter {
    node;
    connection;
    scriptId = null;
    async launch(scriptCode) {
        this.node = await (0, chrome_debugging_client_1.spawnWithWebSocket)(process.execPath, [
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
        this.connection.on("Debugger.paused", (event) => {
            this.emit("stopOnBreakpoint");
        });
    }
    async setBreakPoint(line) {
        if (!this.scriptId)
            throw new Error("No scriptId available yet");
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
exports.ChromeRuntime = ChromeRuntime;
//# sourceMappingURL=ChromeRuntime.js.map