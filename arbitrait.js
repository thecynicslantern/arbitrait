const findFirst = (ar, cb) => {
    for (var i = 0; i < ar.length; i++) if (cb(ar[i])) return ar[i];
};

const createTrait = (funcs) => {
    var symbol = Symbol();
    var impls = {}; // { ConstrName: [ [constr, fns], ... ] }
    const findImpl = constr => {
        const pair = impls[constr.name] && findFirst(impls[constr.name], pair => pair[0] === constr);
        return pair && pair[1];
    };
    var trait = obj => {
        var implementedFuncs = findImpl(obj.constructor);
        // haven't decided whether to allow implicit global impls with default funcs
        // leaning towards "no" for consistency
        if (implementedFuncs === undefined) {
            throw new Error("Trait not implemented for " + obj.constructor.name);
        }
        // if allowing implicit impl...
        // implementedFuncs = implementedFuncs == undefined ? {} : implementedFuncs[1];

        // combine with default funcs
        var combined = { ...funcs, ...implementedFuncs };
        // bind
        Object.keys(combined).forEach(k => combined[k] = combined[k].bind(obj));
        return combined;
    };
    trait.implementedFor = (constructor) => {
        return !!impls[constructor.name]
            && impls[constructor.name].some(pair => pair[0] === constructor);
    };
    trait.implement = (constructor, implFuncs = {}) => {
        if (Array.isArray(constructor)) { // allow array of constrs
            constructor.forEach(c => trait.implement(c, implFuncs));
            return;
        }
        if(trait.implementedFor(constructor)) throw new Error("Trait already implemented for " + constructor.name);
        // allow trait(Sub,Parent)
        if (typeof implFuncs == "function") {
            const srcImpl = findImpl(implFuncs);
            if (!srcImpl) throw new Error("Trait not implemented for " + implFuncs.name);
            trait.implement(constructor, srcImpl);
            return;
        }
        Object.keys(implFuncs).forEach(k => {
            if (!funcs.hasOwnProperty(k)) throw new Error(k + " does not exist in this trait");
        });
        Object.keys(funcs).forEach(k => {
            // make sure all abstract fns provided
            if (typeof funcs[k] !== "function" && !implFuncs[k])
                throw new Error("Trait implementation for " + constructor.name + " missing `" + k + "`");
            // check signature
            if (implFuncs[k]) {
                var expectedParamCount = typeof funcs[k] == "function"
                    ? funcs[k].length
                    : Number(funcs[k]);
                if (implFuncs[k].length !== expectedParamCount)
                    throw new Error(`${k} implementation should take ${expectedParamCount} argument(s)`);
            }
        });
        if (impls[constructor.name] === undefined) impls[constructor.name] = [];
        impls[constructor.name].push([constructor, implFuncs]);
    };
    trait[symbol] = symbol;
    trait.is = obj => obj[symbol] === symbol;
    return trait;
};

module.exports = createTrait;