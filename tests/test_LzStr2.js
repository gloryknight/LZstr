
const LzStr2 = require("../LzStr2");
const assert = require('assert');

function to64(c){
    return Buffer.from(c).toString('base64');
}

const text = "test test";
let mini;

// for (s of [" ", "t", "e", ""]){
// LzStr2.config("", s);
// mini = LzStr2.compressToBase64(text);
// console.log( mini );
// console.log( mini.length );
// console.log( LzStr2.dictSize() );
// }

// LzStr2.config("lz0", "");
mini = LzStr2.compressToBase64(text);
assert (text === LzStr2.decompressFromBase64(mini));
assert (mini === "C4UwzsAEoUA===");

mini = LzStr2.compressToB91(text);
assert (text === LzStr2.decompressFromB91(mini));
assert (mini === "EA5,UwA:G}");

mini = LzStr2.compressToEncodedURIComponent(text);
assert (text === LzStr2.decompressFromEncodedURIComponent(mini));
assert (mini === "C4UwzsAEoUA");

mini = LzStr2.compressToUint8Array(text);
assert (text === LzStr2.decompressFromUint8Array(mini));
assert (to64(mini) === "C4UwzsAEoUA=");

mini = LzStr2.compressToArray(text);
assert (text === LzStr2.decompressFromArray(mini));
assert (to64(mini) === "AAAAAA==");

mini = LzStr2.compressToUTF16(text);
assert (text === LzStr2.decompressFromUTF16(mini));
assert (to64(mini) === "16LksZPloKDkqLQgIA==");

mini = LzStr2.compress(text);
assert (text === LzStr2.decompress(mini));
assert (to64(mini) === "4K6F44OO7ICE6oWA");


