// http://pieroxy.net/blog/pages/lz-string/testing.html
//
// LZ-based compression algorithm, version 1.4.6
// prefer inline minified functions from LZstr.min.js
// compress string
Lc = (uncompressed) => {
    // private property
    var bitsPerChar = 16,
        d256 = 256,
        fromCharCode = String.fromCharCode,
        StringStream_o = [],
        StringStream_d = [],
        StringStream_v = 0,
        StringStream_p = 0,
        StringStream_b = bitsPerChar,
        j = 0, value = 0,
        dictionary = {},
        freshNode = true,
        c = 0,
        node, // first node will always be initialised like this.
        nextNode,
        dictSize = 2,
        numBitsMask = 0b100,
        forceBreak = true,

        StringStream_s = (value, numBitsMask) => { //streamBits
            StringStream_o.push([value, numBitsMask]);
            for (var i = 0; numBitsMask >>= 1; i++) {
                // shifting has precedence over bitmasking
                StringStream_v = value >> i & 1 | StringStream_v << 1;
                if (++StringStream_p === StringStream_b) {
                    StringStream_p = 0;
                    StringStream_d.push(fromCharCode(StringStream_v));
                    StringStream_v = 0;
                }
            }
        },

        newSymbol = () => {
            // Prefix+charCode does not exist in trie yet.
            // We write the prefix to the bitstream, and add
            // the new charCode to the dictionary if it's new
            // Then we set `node` to the root node matching
            // the charCode.

            if (freshNode) {
                // Prefix is a freshly added character token,
                // which was already written to the bitstream
                freshNode = false;
            } else {
                // write out the current prefix token
                StringStream_s(node.v, numBitsMask);
            }

            // Is the new charCode a new character
            // that needs to be stored at the root?
            if (dictionary[c] == undefined) {
                // increase token bitlength if necessary
                if (++dictSize >= numBitsMask) {
                    numBitsMask <<= 1;
                }


                // insert "new 8/16 bit charCode" token,
                // see comments above for explanation
                value = c < 256 ? 0 : 1;
                StringStream_s(value, numBitsMask);
                StringStream_s(c, value ? 0b10000000000000000 : 0b100000000);

                dictionary[c] = { v: dictSize, d: {} };
                // Note of that we already wrote
                // the charCode token to the bitstream
                freshNode = true;
            }
            // increase token bitlength if necessary
            if (++dictSize >= numBitsMask) {
                numBitsMask <<= 1;
            }
        };

    // The first charCode is guaranteed to be new
    c = uncompressed.charCodeAt(0);

    newSymbol();
    numBitsMask = 4;
    --dictSize;
    node = dictionary[c];

    for (j = 1; j < uncompressed.length; j++) {
        c = uncompressed.charCodeAt(j);
        // does the new charCode match an existing prefix?
        nextNode = node.d[c];
        if (nextNode) {
            // continue with next prefix
            node = nextNode;
        } else {

            // Is the new charCode a new character
            // that needs to be stored at the root?
            newSymbol();

            // splitting magic - separate on comma leading to big gain for JSON!
            node.d[c] = { v: dictSize, d: {} };

            // set node to first charCode of new prefix
            node = dictionary[c];
        }
    }

    // Is c a new character?
    newSymbol();
    //}

    // Mark the end of the stream
    StringStream_s(2, numBitsMask);
    // Flush the last char
    StringStream_v <<= StringStream_b - StringStream_p;
    StringStream_d.push(fromCharCode(StringStream_v));
    return StringStream_d.join('');
}

// http://pieroxy.net/blog/pages/lz-string/testing.html
//
// LZ-based compression algorithm, version 1.4.6
// decompress compressed string
Ld = (compressed) => {
    var fromCharCode = String.fromCharCode,
        length = compressed.length,
        getNextValue = compressed.charCodeAt.bind(compressed),
        resetBits = 16,
        empty = '',
        dictionary = [empty, empty, empty],
        enlargeIn = 4,
        dictSize = 4,
        numBits = 3,
        entry,
        result = [],
        bits = 0,
        maxpower = 2,
        power = 0,
        c,
        data_val = getNextValue(0),
        data_position = resetBits,
        data_index = 1;
    //         breakCode=44;

    // slightly decreases decompression but strongly decreases size
    var getBits = () => {
        bits = power = 0;
        while (power != maxpower) {
            // shifting has precedence over bitmasking
            bits += (data_val >> --data_position & 1) << power++;
            if (data_position == 0) {
                data_position = resetBits;
                data_val = getNextValue(data_index++);
            }
        }
    };

    // Get first token, guaranteed to be either
    // a new character token (8 or 16 bits)
    // or end of stream token.
    getBits();

    // else, get character
    maxpower = bits * 8 + 8;
    getBits();
    c = fromCharCode(bits);
    dictionary[3] = c;
    result.push(c);

    // read rest of string
    while (data_index <= length) {
        // read out next token
        maxpower = numBits;
        getBits();

        // 0 or 1 implies new character token
        if (bits < 2) {
            maxpower = (8 + 8 * bits);
            getBits();

            dictionary[dictSize] = fromCharCode(bits);
            bits = dictSize++;
            if (--enlargeIn == 0) {
                enlargeIn = 1 << numBits++;
            }
        } else if (bits == 2) {
            // end of stream token
            return result.join(empty);
        }

        entry = bits < dictionary.length ? dictionary[bits] : c + c.charAt(0);
        result.push(entry);
        // if (breakCode!==c.charCodeAt(0) && breakCode===entry.charCodeAt(entry.length-1)) {
        //     enlargeIn++; 
        // } else {
        // Add c+entry[0] to the dictionary.
        dictionary[dictSize++] = c + entry.charAt(0);
        // }

        c = entry;

        if (--enlargeIn == 0) {
            enlargeIn = 1 << numBits++;
        }

    }
}

if (typeof module !== 'undefined' && module != null) {
    module.exports = { Lc, Ld };
}

// In a browser environment targeting global scope, Lc and Ld are already global.
