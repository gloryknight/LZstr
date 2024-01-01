
const LzStr2 = require("../LzStr2");
const assert = require('assert');

function to64(c) {
    return Buffer.from(c).toString('base64');
}

const text = '{"film1":{"text":"some test", "author":"Luke Skywalker", "year":2023}, "film2":{"text":"another test", "author":"Joe Black", "year":2022}, "film2":{"text":"another test", "author":"Joe Black", "year":2022}, "film2":{"text":"another test", "author":"Joe Black", "year":2022}, "film2":{"text":"another test", "author":"Joe Black", "year":2022}, "film2":{"text":"another test", "author":"Joe Black", "year":2022}, "film2":{"text":"another test", "author":"Joe Black", "year":2022}, "film2":{"text":"another test", "author":"Joe Black", "year":2022}, "film2":{"text":"another test", "author":"Joe Black", "year":2022}, "film2":{"text":"another test", "author":"Joe Black", "year":2022}, "film2":{"text":"another test", "author":"Joe Black", "year":2022}, "film2":{"text":"another test", "author":"Joe Black", "year":2022}, "film2":{"text":"another test", "author":"Joe Black", "year":2022}, "film2":{"text":"another test", "author":"Joe Black", "year":2022}, "film2":{"text":"another test", "author":"Joe Black", "year":2022}, "film2":{"text":"another test", "author":"Joe Black", "year":2022}, "film2":{"text":"another test", "author":"Joe Black", "year":2022}, "film2":{"text":"another test", "author":"Joe Black", "year":2022}}'

let mini, text_new;

assert(3 === LzStr2.compress("").length);
assert(2 === LzStr2.decompress(LzStr2.compress("")).length);
assert("1" === LzStr2.decompress(LzStr2.compress("1")));
assert("1" === LzStr2.decompressFromB91(LzStr2.compressToB91("1")));
assert("tBBlABAA" === LzStr2.compressToB91(""));
assert(undefined === LzStr2.decompress(""));
assert(undefined === LzStr2.decompressFromUint8Array(""));
assert(undefined === LzStr2.decompressFromB91(""));

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
assert(mini.slice(0, 3) === "lz0");
assert(mini.length === 206);
assert(text === LzStr2.decompress(mini));

mini = LzStr2.compressToBase64(text);
assert(mini.slice(0, 3) === "lz0");
assert(mini.length === 545);
assert(text === LzStr2.decompressFromBase64(mini));

LzStr2.config("lz0", ",");
mini = LzStr2.compress(text);
assert(mini.slice(0, 3) === "lz0");
assert(mini.length === 180);
assert(text === LzStr2.decompress(mini));

LzStr2.config(null, "");
mini = LzStr2.compress(text);
assert(mini.length === 203);
assert(text === LzStr2.decompress(mini));

// errors
let pass = false;
try { mini = LzStr2.decompress(); } catch (e) { pass = true }
assert(pass);
try { mini = LzStr2.decompress(NaN); } catch (e) { pass = true }
assert(pass);
try { mini = LzStr2.decompress(undefined); } catch (e) { pass = true }
assert(pass);
try { mini = LzStr2.decompress(12); } catch (e) { pass = true }
assert(pass);
