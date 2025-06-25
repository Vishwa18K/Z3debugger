"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MockRuntime = void 0;
class MockRuntime {
    // the initial (and one and only) file we are 'debugging'
    _sourceFile = '';
    get sourceFile() {
        return this._sourceFile;
    }
}
exports.MockRuntime = MockRuntime;
//# sourceMappingURL=mydebugsession.js.map