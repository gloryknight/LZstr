
const LzStr2 = require("../LzStr2");
const assert = require('assert');

function to64(c) {
    return Buffer.from(c).toString('base64');
}

const text = '{"film1":{"text":"some test", "author":"Luke Skywalker", "year":2023}, "film2":{"text":"another test", "author":"Joe Black", "year":2022}, "film2":{"text":"another test", "author":"Joe Black", "year":2022}, "film2":{"text":"another test", "author":"Joe Black", "year":2022}, "film2":{"text":"another test", "author":"Joe Black", "year":2022}, "film2":{"text":"another test", "author":"Joe Black", "year":2022}, "film2":{"text":"another test", "author":"Joe Black", "year":2022}, "film2":{"text":"another test", "author":"Joe Black", "year":2022}, "film2":{"text":"another test", "author":"Joe Black", "year":2022}, "film2":{"text":"another test", "author":"Joe Black", "year":2022}, "film2":{"text":"another test", "author":"Joe Black", "year":2022}, "film2":{"text":"another test", "author":"Joe Black", "year":2022}, "film2":{"text":"another test", "author":"Joe Black", "year":2022}, "film2":{"text":"another test", "author":"Joe Black", "year":2022}, "film2":{"text":"another test", "author":"Joe Black", "year":2022}, "film2":{"text":"another test", "author":"Joe Black", "year":2022}, "film2":{"text":"another test", "author":"Joe Black", "year":2022}, "film2":{"text":"another test", "author":"Joe Black", "year":2022}}'

let mini, text_new;

// for (s of [" ", "t", "e", ""]){
// LzStr2.config("", s);
// mini = LzStr2.compressToBase64(text);
// console.log( mini );
// console.log( mini.length );
// console.log( LzStr2.dictSize() );
// }

// LzStr2.config("lz0", "");
mini = LzStr2.compressToBase64(text);
assert(mini.length === 542);
assert(text === LzStr2.decompressFromBase64(mini));

mini = LzStr2.compressToB91(text);
assert(mini.length === 500);
assert(text === LzStr2.decompressFromB91(mini));

mini = LzStr2.compressToEncodedURIComponent(text);
assert(mini.length === 542);
assert(text === LzStr2.decompressFromEncodedURIComponent(mini));

mini = LzStr2.compressToUint8Array(text);
assert(mini.length === 406);
assert(text === LzStr2.decompressFromUint8Array(mini));

mini = LzStr2.compressToArray(text);
assert(mini.length === 203);
assert(text === LzStr2.decompressFromArray(mini));

mini = LzStr2.compressToUTF16(text);
assert(mini.length === 218);
assert(text === LzStr2.decompressFromUTF16(mini));

mini = LzStr2.compress(text);
assert(mini.length === 203);
assert(text === LzStr2.decompress(mini));
// assert (to64(mini) === "...");

LzStr2.config("lz0", "");
mini = LzStr2.compress(text);
assert(mini.slice(0,3) === "lz0");
assert(mini.length === 206);
assert(text === LzStr2.decompress(mini));

mini = LzStr2.compressToBase64(text);
assert(mini.slice(0,3) === "lz0");
assert(mini.length === 545);
assert(text === LzStr2.decompressFromBase64(mini));

LzStr2.config("lz0", ",");
mini = LzStr2.compress(text);
assert(mini.slice(0,3) === "lz0");
assert(mini.length === 180);
assert(text === LzStr2.decompress(mini));

LzStr2.config(null, "");
mini = LzStr2.compress(text);
assert(mini.length === 203);
assert(text === LzStr2.decompress(mini));
