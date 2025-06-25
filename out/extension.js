"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
function activate(context) {
    console.log('Zblack debugger is now active.');
}
function deactivate() { }
// const { spawn } = require('child_process');
// const child = cp.spawn('node', ['--inspect=9229', 'test.js'], {
//     stdio: 'inherit'
// });
// child.on('error', (err: { message: any; }) => {
//   console.error(`Failed to start child process: ${err.message}`);
// });
// CDP({ port: 9229 }, async (client) => {
//   const { Debugger, Runtime } = client;
//   await Debugger.enable();
//   await Runtime.enable();
//   Debugger.paused((params) => {
//     console.log('Paused at:', params.callFrames[0].url);
//   });
//   // Example: resume execution
//   await Debugger.resume();
//   // ... more logic ...
// }).on('error', (err) => {
//   console.error('Cannot connect to target:', err);
// });
// child.stdout.on('data', (data: any) => {
//   console.log(`stdout: ${data}`);
// });
// child.stderr.on('data', (data: any) => {
//   console.error(`stderr: ${data}`);
// });
// child.on('close', (code: any) => {
//   console.log(`child process exited with code ${code}`);
// });
//# sourceMappingURL=extension.js.map