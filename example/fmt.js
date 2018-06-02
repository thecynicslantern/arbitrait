const trait = require("../arbitrait");

/*
    This library leverages arbitrait to allow basic rust-like trait-based formatting for classes
    without modifying said classes or their prototypes

    You can enable formatting for a class with
    fmt.traits.Debug.implement(MyClass, {
        fmt: function(){ return this.debugStr(); }
    });

    Your class is now fmt-compatible though unchanged:
    console.log(fmt("My object is {?}", objectOfMyClass));
*/

var fmt = (s, ...insertions) => {
    var i = 0, match;
    return s.replace(/\{(.*?)\}/g, (m, n) => {
        var replacement = insertions[i++];
        if (replacement === undefined) throw new Error("Missing insertion #" + i);

        if (n === '') return replacement;
        if (match = n.match(/^\.(\d)$/)) {
            return Number(replacement).toFixed(match[1]);
        } else if (match = n.match(/^:(\d+)$/)) {
            return fmt.traits.LeftPad(replacement).pad(match[1]);
        } else if (match = n.match(/^:(x|X)$/)) {
            return (match[1] == "X"
                ? fmt.traits.UpperHex
                : fmt.traits.LowerHex
            )(replacement).convert();
        } else if (n == "?") { // Debug trait
            return fmt.traits.Debug(replacement).fmt();
        }
        throw new Error("Invalid modifier");
    });
};

fmt.traits = {
    LowerHex: trait({ convert: 0 }),
    UpperHex: trait({ convert: 0 }),
    Debug: trait({ fmt: function () { return "" + this; } }),
    LeftPad: trait({ pad: 1 })
};

fmt.traits.LowerHex.implement(Number, { convert: function () { return this.toString(16); } });
fmt.traits.UpperHex.implement(Number, { convert: function () { return this.toString(16).toUpperCase(); } });
fmt.traits.Debug.implement(String);
fmt.traits.Debug.implement(Number, { fmt: function () { return this.toString(); } });

fmt.traits.LeftPad.implement(String, {
    pad: function (targetLength) {
        var s = this;
        while (s.length < targetLength) s = " " + s;
        return s;
    }
});

fmt.traits.LeftPad.implement(Number, {
    pad: function (targetLength) {
        var s = this.toString();
        while (s.length < targetLength) s = "0" + s;
        return s;
    }
});

module.exports = fmt;