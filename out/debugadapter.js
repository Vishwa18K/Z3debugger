"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const debugadapter_1 = require("@vscode/debugadapter");
const fs = __importStar(require("fs"));
const ChromeRuntime_1 = require("./ChromeRuntime");
class MyDebugSession extends debugadapter_1.LoggingDebugSession {
    _runtime;
    static threadID = 1;
    constructor() {
        super("my-debugger.log");
        this._runtime = new ChromeRuntime_1.ChromeRuntime();
        this._runtime.on('stopOnBreakpoint', () => {
            this.sendEvent(new debugadapter_1.StoppedEvent('breakpoint', MyDebugSession.threadID));
        });
        this._runtime.on('stopOnEntry', () => {
            this.sendEvent(new debugadapter_1.StoppedEvent('entry', MyDebugSession.threadID));
        });
    }
    async launchRequest(response, args) {
        this.sendEvent(new debugadapter_1.InitializedEvent());
        const code = fs.readFileSync(args.program, 'utf8');
        await this._runtime.launch(code);
        this.sendResponse(response);
    }
    continueRequest(response, args) {
        this._runtime.resume().then(() => {
            this.sendResponse(response);
        });
    }
    ;
    setBreakPointsRequest(response, args) {
        const breakpoints = args.breakpoints || [];
        const bpPromises = breakpoints.map(bp => this._runtime.setBreakPoint(bp.line));
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
//# sourceMappingURL=debugadapter.js.map