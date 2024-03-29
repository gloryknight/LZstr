// LZ-based compression algorithm, with header and splitting, v2.0.8
// based on LZString but with optional header and optional stemming. Use config(header, breakSymbol)
var LZString = (() => {
    // private property
    var i = 0,
        d256 = 256,
        d65536 = 65536,
        //charCodeAt0=(a)=>{return a.charCodeAt(0);},
        emptyString = '',
        breakSymbol = emptyString,
        breakCode,
        header,
        fromCharCode = String.fromCharCode,
        base = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
        baseExt64 = '+/',
        baseExtUri = '-.~',
        Base64CharArray = (base + baseExt64).split(emptyString),
        UriSafeCharArray = (base + baseExtUri).split(emptyString),
        B91CharArray = (base + baseExt64 + baseExtUri + '!#$%&()*,:;<>?@[]^_`{|}=').split(emptyString),
        nulli = null,
        dictSize,
        join = (array) => { return array.join(emptyString); },
        charCodeAt0 = (string) => { return string.charCodeAt(0); },
        charCodeAt = (string, position) => { return string.charCodeAt(position); },
        _compress = (uncompressed, bitsPerChar, getCharFromInt) => {
            // private property
            var StringStream_d = [],
                StringStream_v = 0,
                StringStream_p = 0,
                StringStream_b = bitsPerChar,
                k = 0, value = 0,
                node = [3], // first node will always be initialised like this.
                dictionary = [2, 2, node],
                freshNode = true,
                c = 0,
                numBitsMask = 0b100,
                forceBreak = true,
                node_length = 0,
                dictionary_length = 0,

                node_push = () => {
                    node.push(c);
                    node.push([dictSize]);
                },
                node_push_sub = node_push,

                StringStream_s = (value, numBitsMask) => { //streamBits
                    for (var i = 0; numBitsMask >>= 1; i++) {
                        // shifting has precedence over bitmasking
                        StringStream_v = value >> i & 1 | StringStream_v << 1;
                        if (++StringStream_p === StringStream_b) {
                            StringStream_p = 0;
                            StringStream_d.push(getCharFromInt(StringStream_v));
                            StringStream_v = 0;
                        }
                    }
                },

                newSymbol = () => {
                    if (freshNode) {
                        // Prefix is a freshly added character token,
                        // which was already written to the bitstream
                        freshNode = false;
                    } else {
                        // write out the current prefix token
                        StringStream_s(node[0], numBitsMask);
                    }

                    // Is the new charCode a new character
                    // that needs to be stored at the root?
                    //         if (dictionary[c]==undefined) {
                    k = 1; dictionary_length = dictionary.length;
                    while (dictionary[k] != c && k < dictionary_length) {
                        k += 2;
                    }
                    if (k == dictionary_length) {
                        // increase token bitlength if necessary
                        if (++dictSize >= numBitsMask) {
                            numBitsMask <<= 1;
                        }


                        // insert "new 8/16 bit charCode" token,
                        // see comments above for explanation
                        value = c < 256 ? 0 : 1;
                        StringStream_s(value, numBitsMask);
                        StringStream_s(c, value ? d65536 : d256);

                        //             dictionary[c] = { v: dictSize, d: {} };
                        dictionary.push(c);
                        dictionary.push([dictSize]);

                        // Note of that we already wrote
                        // the charCode token to the bitstream
                        freshNode = true;
                    }
                    // increase token bitlength if necessary
                    if (++dictSize >= numBitsMask) {
                        numBitsMask <<= 1;
                    }
                },
                dictSize = 3;

            if (breakCode) {
                node_push = () => {
                    // splitting magic - separate on comma leading to big gain for JSON!
                    if (breakCode === c) {
                        if (forceBreak) {
                            if (--dictSize >= numBitsMask) {
                                numBitsMask >>= 1;
                            }
                            forceBreak = false;
                        } else {
                            // add node representing prefix + new charCode to trie
                            node_push_sub();

                        }
                    } else {
                        forceBreak = true;
                        // add node representing prefix + new charCode to trie
                        node_push_sub();
                    }
                };
            }

            // If there is a string, the first charCode is guaranteed to
            // be new, so we write it to output stream, and add it to the
            // dictionary. For the same reason we can initialize freshNode
            // as true, and new_node, node and dictSize as if
            // it was already added to the dictionary (see above).

            c = charCodeAt0(uncompressed);

            // == Write first charCode token to output ==

            // 8 or 16 bit?
            value = c < d256 ? 0 : 1;

            // insert "new 8/16 bit charCode" token
            // into bitstream (value 1)
            StringStream_s(value, numBitsMask);
            StringStream_s(c, value ? d65536 : d256);

            // Add charCode to the dictionary.
            dictionary[1] = c;

            nextchar:
            for (var uncompressed_length = uncompressed.length, j = 1; j < uncompressed_length; j++) {
                c = uncompressed.charCodeAt(j);
                // does the new charCode match an existing prefix?
                //         nextNode = node.d[c];
                //         if (nextNode) {
                //             // continue with next prefix
                //             node = nextNode;
                //         } else {

                // does the new charCode match an existing prefix?
                node_length = node.length;
                for (k = 1; k < node_length; k += 2) {
                    if (node[k] == c) {
                        node = node[k + 1];
                        continue nextchar;
                    }
                }
                // we only end up here if there is no matching char

                // Is the new charCode a new character
                // that needs to be stored at the root?
                // Prefix+charCode does not exist in trie yet.
                // We write the prefix to the bitstream, and add
                // the new charCode to the dictionary if it's new
                // Then we set `node` to the root node matching
                // the charCode.


                newSymbol();
                node_push();

                // set node to first charCode of new prefix
                //             node = dictionary[c];
                node = dictionary[k + 1];
                //         }
            }

            // Is c a new character?
            // Prefix+charCode does not exist in trie yet.
            // We write the prefix to the bitstream, and add
            // the new charCode to the dictionary if it's new
            // Then we set `node` to the root node matching
            // the charCode.

            newSymbol();

            // Mark the end of the stream
            StringStream_s(2, numBitsMask);
            // Flush the last char
            StringStream_v <<= StringStream_b - StringStream_p;
            StringStream_d.push(getCharFromInt(StringStream_v));
            header ? StringStream_d.unshift(header) : 0

            return StringStream_d;
        },
        _decompress = (length, resetBits, getNextValue) => {
            var dictionary = [emptyString, emptyString, emptyString],
                enlargeIn = 4,
                numBits = 3,
                entry,
                result = [],
                bits = 0,
                maxpower = 2,
                power = 0,
                c,
                data_index = header ? header.length : 0,
                data_val = getNextValue(data_index),
                data_position = resetBits,
                add_entry0 = () => {
                    dictionary[dictSize++] = c + entry.charAt(0);
                },
                add_entry0_sub = add_entry0;
            dictSize = 4;
            data_index++;

            if (breakCode) {
                add_entry0 = () => {
                    // splitting magic - separate on comma leading to big gain for JSON!
                    if (breakSymbol === entry[0]) {
                        if (breakSymbol === c[0]) {
                            add_entry0_sub();
                        } else {
                            enlargeIn++;
                        }
                    } else {
                        add_entry0_sub();
                    }
                };
            }
            if (power) { return nulli; }
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
                    return join(result);
                }

                entry = bits < dictionary.length ? dictionary[bits] : c + c.charAt(0);
                result.push(entry);
                add_entry0();
                c = entry;

                if (--enlargeIn == 0) {
                    enlargeIn = 1 << numBits++;
                }

            }
        },
        _compressToArray = (uncompressed) => {
            return _compress(uncompressed, 16, fromCharCode);
        },
        _decompressFromArray = (compressed) => {
            if (compressed == nulli) return emptyString;
            if (compressed.length == 0) return nulli;
            return _decompress(compressed.length, 16, (a) => { return charCodeAt0(compressed[a]); });
        },

        _config = (head, Symbol) => {
            header = head;
            breakSymbol = Symbol;
            breakCode = charCodeAt0(Symbol);
        };

    return {
        compressToBase64: (input) => {
            // no padding is added. Not valid Base64.
            var getCharFromBase64 = (a) => { return Base64CharArray[a]; },
                res = _compress(input, 6, getCharFromBase64);
            return join(res);
        },

        decompressFromBase64: (compressed) => {
            var reverseDict = {};
            Base64CharArray.forEach((x, i) => {
                // if (reverseDict[charCodeAt0(x)]){new Error(i, x)};
                reverseDict[charCodeAt0(x)] = i
            })
            return _decompress(compressed.length, 6, (index) => { return reverseDict[charCodeAt(compressed, index)]; });
        },

        compressToUTF16: (input) => {
            var getCharFromUTF16 = (a) => { return fromCharCode(a + 32); },
                compressed = _compress(input, 15, getCharFromUTF16);
            compressed.push(' ');
            return join(compressed);
        },

        decompressFromUTF16: (compressed) => {
            return _decompress(compressed.length, 15, (index) => { return charCodeAt(compressed, index) - 32; });
        },

        //compress into uint8array (UCS-2 big endian format)
        compressToUint8Array: (uncompressed) => {
            return Uint8Array.from(_compress(uncompressed, 8, (index) => { return index; }));
        },

        //decompress from uint8array (UCS-2 big endian format)
        decompressFromUint8Array: (compressed) => {
            return _decompress(compressed.length, 8, (index) => { return compressed[index]; });
        },

        //compress into a string that is already URI encoded
        compressToEncodedURIComponent: (input) => {
            var getCharFromURISafe = (a) => { return UriSafeCharArray[a]; };
            return join(_compress(input, 6, getCharFromURISafe));
        },

        //decompress from an output of compressToEncodedURIComponent
        decompressFromEncodedURIComponent: (compressed) => {
            //input = input.replace(/ /g, '+');
            var reverseDict = {};
            UriSafeCharArray.forEach((x, i) => {
                // if (reverseDict[charCodeAt0(x)]){new Error(i, x)};
                reverseDict[charCodeAt0(x)] = i
            })
            return _decompress(compressed.length, 6, (index) => { return reverseDict[charCodeAt(compressed, index)]; });
        },

        //compress into a string that is already URI encoded
        compressToB91: (input) => {
            var getCharFromC91 = (a) => { return B91CharArray[Math.floor(a / 91)] + B91CharArray[a % 91]; };
            // 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxuz0123456789!#$%&()*+,./:;<=>?@[]^_`{|}~"'
            return join(_compress(input, 13, getCharFromC91));
        },

        //decompress from an output of compressToEncodedURIComponent
        decompressFromB91: (compressed) => {
            var reverseDict = {};
            B91CharArray.forEach((x, i) => {
                // if (reverseDict[charCodeAt0(x)]){new Error(i, x)};
                reverseDict[charCodeAt0(x)] = i
            })
            return _decompress(compressed.length / 2, 13, (index) => { return reverseDict[charCodeAt(compressed, index * 2)] * 91 + reverseDict[charCodeAt(compressed, index * 2 + 1)]; });
        },

        compress: (uncompressed) => {
            return join(_compressToArray(uncompressed));
        },

        decompress: (compressed) => {
            return _decompress(compressed.length, 16, (index) => { return compressed.charCodeAt(index); });
        },

        compressToArray: _compressToArray,

        decompressFromArray: _decompressFromArray,

        config: _config,
        dictSize: () => dictSize
    };
})();

if (typeof define === 'function' && define.amd) {
    define(function () { return LZString; });
} else if (typeof module !== 'undefined' && module != null) {
    module.exports = LZString;
} else if (typeof angular !== 'undefined' && angular != null) {
    angular.module('LZString', []).factory('LZString', function () { return LZString; });
}

// window.onload=()=>{    console.log(LZString.compress("here it comes here it "));};
