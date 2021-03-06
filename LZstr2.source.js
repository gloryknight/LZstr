// Beta - breaks compatibility!
// LZ-based compression algorithm
function Lc(uncompressed) {
	// private property
	var bitsPerChar=16, 
		d256=256,
		fromCharCode = String.fromCharCode,
		StringStream_d = [],
		StringStream_v = 0,
		StringStream_p = 0,
		StringStream_b = bitsPerChar,
		j = 0, k = 0, value = 0,
		node = [3], // first node will always be initialised like this.
		dictionary = [2, 2, node],
		freshNode = true,
		c = 0,
		nextNode,
		dictSize = 3,
		numBitsMask = 0b100,
		forceBreak=true,
		breakCode=44;

	function StringStream_s(value, numBitsMask) { //streamBits
		for (var i = 0; numBitsMask >>= 1; i++) {
			// shifting has precedence over bitmasking
			StringStream_v = value >> i & 1 | StringStream_v << 1;
			if (++StringStream_p === StringStream_b) {
				StringStream_p = 0;
				StringStream_d.push(fromCharCode(StringStream_v));
				StringStream_v = 0;
			}
		}
	}

	//function _compress(uncompressed, bitsPerChar, getCharFromInt) {

	//if (uncompressed.length) {
	// If there is a string, the first charCode is guaranteed to
	// be new, so we write it to output stream, and add it to the
	// dictionary. For the same reason we can initialize freshNode
	// as true, and new_node, node and dictSize as if
	// it was already added to the dictionary (see above).

	c = uncompressed.charCodeAt(0);

	// == Write first charCode token to output ==

	// 8 or 16 bit?
	value = c < d256 ? 0 : 1;

	// insert "new 8/16 bit charCode" token
	// into bitstream (value 1)
	StringStream_s(value, numBitsMask);
	StringStream_s(c, value ? 0b10000000000000000 : d256);

	// Add charCode to the dictionary.
	dictionary[1] = c;

	nextchar:
	for (j = 1; j < uncompressed.length; j++) {
		c = uncompressed.charCodeAt(j);
		// does the new charCode match an existing prefix?
		for (k = 1; k < node.length; k += 2) {
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
		k = 1;
		while (dictionary[k] != c && k < dictionary.length) {
			k += 2;
		}
		if (k == dictionary.length) {
			// increase token bitlength if necessary
			if (++dictSize >= numBitsMask) {
				numBitsMask <<= 1;
			}


			// insert "new 8/16 bit charCode" token,
			// see comments above for explanation
			value = c < 256 ? 0 : 1;
			StringStream_s(value, numBitsMask);
			StringStream_s(c, value ? 0b10000000000000000 : 0b100000000);

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

		// splitting magic - separate on comma leading to big gain for JSON!
		//if (breakCode===c && dictSize<8000) {
		if (breakCode===c) {
			if (forceBreak) {
				if (--dictSize >= numBitsMask) {
					numBitsMask >>= 1;
				}
				forceBreak=false;
			} else {
				// add node representing prefix + new charCode to trie
				// 					node.d[c] = { v: dictSize, d: {} };
				node.push(c);
				node.push([dictSize]);

			}
		} else {
			forceBreak=true;
			// add node representing prefix + new charCode to trie
			// 				node.d[c] = { v: dictSize, d: {} };
			node.push(c);
			node.push([dictSize]);
		}

		// set node to first charCode of new prefix
		// 			node = dictionary[c];
		node = dictionary[k + 1];
		// 		}
	}

	// Is c a new character?
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
			StringStream_s(node[0], numBitsMask);
		}

		// Is the new charCode a new character
		// that needs to be stored at the root?
		k = 1;
		while (dictionary[k] != c && k < dictionary.length) {
			k += 2;
		}
		if (k == dictionary.length) {
			// increase token bitlength if necessary
			if (++dictSize >= numBitsMask) {
				numBitsMask <<= 1;
			}


			// insert "new 8/16 bit charCode" token,
			// see comments above for explanation
			value = c < 256 ? 0 : 1;
			StringStream_s(value, numBitsMask);
			StringStream_s(c, value ? 0b10000000000000000 : 0b100000000);

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

	// Mark the end of the stream
	StringStream_s(2, numBitsMask);
	// Flush the last char
	StringStream_v <<= StringStream_b - StringStream_p;
	StringStream_d.push(fromCharCode(StringStream_v));
	return StringStream_d.join('');
}

// LZ-based compression algorithm
function Ld(compressed) {
	var fromCharCode = String.fromCharCode,
		length=compressed.length,
		resetBits=16,
		empty='',
		dictionary = [empty, empty, empty],
		enlargeIn = 4,
		dictSize = 4,
		numBits = 3,
		entry,
		result = [],
		bits = 0,
		maxpower=2,
		power = 0,
		c,
		data_val = compressed.charCodeAt(0),
		data_position = resetBits,
		data_index = 1,
		breakSybol=fromCharCode(44);

	// slightly decreases decompression but strongly decreases size
	var getBits = () => {
		bits = power = 0;
		while (power != maxpower) {
			// shifting has precedence over bitmasking
			bits += (data_val >> --data_position & 1) << power++;
			if (data_position == 0) {
				data_position = resetBits;
				data_val = compressed.charCodeAt(data_index++);
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
		// splitting magic - separate on comma leading to big gain for JSON!
		if (breakSybol===entry[0]) {
			if (breakSybol===c[0]){
				// 		Add c+entry[0] to the dictionary.
				dictionary[dictSize++] = c + entry.charAt(0);
			} else {
				enlargeIn++; 
			}
		} else {
			// 		Add c+entry[0] to the dictionary.
			dictionary[dictSize++] = c + entry.charAt(0);
		}

		c = entry;

		if (--enlargeIn == 0) {
			enlargeIn = 1 << numBits++;
		}

	}
}
