What and Why
============

Loosely based on [traits in Rust](https://doc.rust-lang.org/book/second-edition/ch10-02-traits.html), traits in JavaScript/LiveScript provide a way to safely extend objects without modifying them.

Everyone knows we shouldn't modify `Array.prototype`. But what if we really want to have, say, `array.first()`? We can get something close, compartmentalised neatly and harmlessly in a trait!

```
npm install arbitrait
```

```js
const trait = require("arbitrait");

// define a trait
const Serial = trait({
    slice: function(s, e){
        return Array.prototype.slice.call(this, s, e);
    },
    // where no default implementation can be written, specify the number of arguments a method should take
    first: 1, // first(cb), returns first element of a collection that satisfies a callback
    last: 1, // last(cb), returns last element that satisfies a callback
});

// implement our trait for Array and HTMLCollection
Serial.implement([Array, HTMLCollection], {
    first: function(cb){
        for(let i = 0; i < this.length; i++) if(cb(this[i])) return this[i];
    },
    last: function(cb){
        for(let i = this.length - 1; i >= 0; i--) if(cb(this[i])) return this[i];
    }
    // we could override slice for these but the default is fine
});
```

Then to use it we need to wrap our Array/HTMLCollection with the trait to provide the context:

```js
console.log(
    Serial(document.anchors)
        .first(a => /^https/.test(a.href))
        .href
);
```

That is, call `first()` on `document.anchors`, in the context of it being ('*as*') a `Serial`.

See the example/ directory for a more practical use of traits.

Common interface, tailored implementations
==========================================

So we have some constructors...
-------------------------------
```js
const Person = function (name, occupation) { this.name = name; this.occupation = occupation };
const Dog = function (name) { this.name = name; };
const Sheep = function (name, fluffinessFactor) { this.name = name; this.fluffinessFactor = fluffinessFactor };
```


Let's make a trait
------------------

```js
const Talk = trait({
    happy: 0,
    sad: 0
});
```

And implement it for our constructors
-------------------------------------
```js
Talk.implement(Person, {
    happy: function () { return "Hooray! I love being a " + this.occupation; },
    sad: function () { return "Oh no!"; }
});

Talk.implement(Dog, {
    happy: function () { return "Woof!"; },
    sad: function () { return "*whiiiine*"; }
});

Talk.implement(Sheep, {
    happy: function () { return "Mehhh."; },
    sad: function () { return "BEHHH!"; }
});
```

Now let's make some objects
---------------------------
```js
var dude = new Person("Billy", "programmer");
var mutt = new Dog("Fido");
var ewe = new Sheep("Dolly", 100000);
```

And make them speak!
--------------------
```js
console.log("Person, happy:", Talk(dude).happy());
console.log("Person, sad:", Talk(dude).sad());
console.log("Dog, happy:", Talk(mutt).happy());
console.log("Sheep, sad:", Talk(ewe).sad());

/*
Person, happy: Hooray! I love being a programmer
Person, sad: Oh no!
Dog, happy: Woof!
Sheep, sad: BEHHH!
*/

```

Notes
=====

* I'm pondering whether we should walk prototype chains and/or leverage `instanceof` to effectively inherit trait implementations. For now you can explicitly copy/inherit a trait implemenation with `MyTrait.implement(ForConstructor, FromConstructor)`.
* Check if a value has a trait implemented with `MyTrait.implementedFor(myValue.constructor)`.