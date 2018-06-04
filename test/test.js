const trait = require("../arbitrait");

const Write = trait({
    write: 1,
    writeln: function (s) { Write(this).write(s + "\n"); }
});

Write.implement(console.constructor, {
    write: function (s) { this.log(s); }
});

Write(console).write("Write trait OK");

function expectError(errorDesc, cb) {
    try {
        cb();
        console.log(`${errorDesc} error test failed`)
    } catch (e) {
        console.log(`Expecting '${errorDesc}' error; got: ${e.message}`);
    }
}

expectError("already implemented for Console", () => Write.implement(console.constructor, { write: function () { } }));
expectError("`mogwaiRocks` not in trait", () => Write.implement(Array, { mogwaiRocks: function () { }, }));
expectError("missing `write` impl", () => Write.implement(Array, {}));
expectError("incorrect signature", () => Write.implement(Array, { write: function (a, b) { }}));
expectError("not implemented for Object", () => Write({}).write("Oh no!"));

// impl copying
function Logger() {
    this.log = s => console.log(s);
    this.testProp = "OK";
};
const logger = new Logger();

Write.implement(Logger, console.constructor);
Write(logger).write("Copied impl OK");

// multiple impls
const GetProp = trait({
    get: 1
});

GetProp.implement([Array, Logger], {
    get: function (pr) { return this[pr]; }
});

console.log("Multiple implementations 1/2 " + GetProp(["Hello", "OK", "<3"]).get(1));
console.log("Multiple implementations 2/2 " + GetProp(logger).get("testProp"));

// example/fmt test
const fmt = require("../example/fmt");
fmt.traits.Debug.implement(Logger, {
    fmt: () => "OK"
});

console.log(fmt("Example 'fmt' {?}", logger));