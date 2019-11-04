def Lc (uncompressed):
	# private property
	bitsPerChar=16
	#~ StringStream_o = []
	StringStream_d = []
	StringStream_v = 0
	StringStream_p = 0
	StringStream_b = bitsPerChar
	j = 0
	dictionary = {}
	freshNode = True
	c = 0
	dictSize = 2
	numBitsMask = 4

	def StringStream_s (value, numBitsMask):
		nonlocal StringStream_v, StringStream_p, StringStream_d
		#~ print ("c", value, numBitsMask, dictionary)
		#~ StringStream_o.append([value, numBitsMask])
		i = 0
		numBitsMask=numBitsMask >>1
		while (numBitsMask !=0):
			# shifting has precedence over bitmasking
			StringStream_v = value >> i & 1 | StringStream_v << 1
			i+= 1
			numBitsMask=numBitsMask >>1
			StringStream_p+= 1
			if StringStream_p == StringStream_b:
				StringStream_p = 0
				StringStream_d.append(chr(StringStream_v))
				StringStream_v = 0

	def newSymbol ():
		nonlocal freshNode, dictSize, numBitsMask
		# Prefix+charCode does not exist in trie yet.
		# We write the prefix to the bitstream, and add
		# the new charCode to the dictionary if it's new
		# Then we set `node` to the root node matching
		# the charCode.

		if freshNode:
			# Prefix is a freshly added character token,
			# which was already written to the bitstream
			freshNode = False
		else:
			# write out the current prefix token
			StringStream_s(node["v"], numBitsMask)

		# Is the new charCode a new character
		# that needs to be stored at the root?
		if not c in dictionary:
			# increase token bitlength if necessary
			dictSize+=1
			if dictSize >= numBitsMask:
				numBitsMask <<= 1

			# insert "new 8/16 bit charCode" token,
			# see comments above for explanation
			if c < 256:
				value = 0
				size=256
			else:
				value = 1
				size=65536
			StringStream_s(value, numBitsMask)
			StringStream_s(c, size)

			dictionary[c] = { "v": dictSize, "d": {} }
			# Note of that we already wrote
			# the charCode token to the bitstream
			freshNode = True

		# increase token bitlength if necessary
		dictSize+=1
		if dictSize >= numBitsMask:
			numBitsMask <<= 1

	# The first charCode is guaranteed to be new
	c = ord(uncompressed[0])

	newSymbol()
	numBitsMask = 4
	dictSize-=1
	node = dictionary[c]

	#~ for j = 1; j < uncompressed.length; j++:
	for j in range(1,len(uncompressed)):
		c = ord(uncompressed[j])
		# does the new charCode match an existing prefix?
		if c in node["d"]:
			# continue with next prefix
			node = node["d"][c]
		else:

			# Is the new charCode a new character
			# that needs to be stored at the root?
			newSymbol()

			# splitting magic - separate on comma leading to big gain for JSON!
			node["d"][c] = { "v": dictSize, "d": {} }

			# set node to first charCode of new prefix
			node = dictionary[c]



	# Is c a new character?
	newSymbol()

	# Mark the end of the stream
	StringStream_s(2, numBitsMask)
	# Flush the last char
	StringStream_v <<= StringStream_b - StringStream_p
	StringStream_d.append(chr(StringStream_v))
	return "".join(StringStream_d)

def Ld (compressed):
	length=len(compressed)
	#~ getNextValue=compressed.charCodeAt.bind(compressed)
	resetBits=16
	empty=''
	dictionary = [empty, empty, empty]
	enlargeIn = 4
	dictSize = 4
	numBits = 3
	#~ entry
	result = []
	bits = 0
	maxpower=2
	#~ c
	data_val = ord(compressed[0])
	data_position = resetBits
	data_index = 0

	# slightly decreases decompression but strongly decreases size
	def getBits ():
		nonlocal data_val, data_position, resetBits, compressed, data_index, bits, dictSize
		bits = power = 0
		while power != maxpower:
			# shifting has precedence over bitmasking
			data_position-=1
			bits += (data_val >> data_position & 1) << power
			#~ print ("S ", compressed[data_index], data_index, bits, data_position, data_val, power)
			power+=1
			if data_position == 0:
				data_position = resetBits
				#~ print (compressed[data_index], data_index)
				data_index+=1
				data_val = ord(compressed[data_index])




	# Get first token, guaranteed to be either
	# a new character token (8 or 16 bits)
	# or end of stream token.
	getBits()

	# else, get character
	maxpower = bits * 8 + 8
	getBits()
	c = chr(bits)
	dictionary.append(c)
	result.append(c)

	# read rest of string
	while data_index <= length:
		# read out next token
		maxpower = numBits
		getBits()

		# 0 or 1 implies new character token
		if bits < 2:
			maxpower = (8 + 8 * bits)
			getBits()

			#~ print (result, dictionary, dictSize, chr(bits), bits,"\n")
			#~ dictionary[dictSize] = chr(bits)
			dictionary.append(chr(bits))
			bits = dictSize
			dictSize+=1
			enlargeIn-=1
			if enlargeIn == 0:
				enlargeIn = 1 << numBits
				numBits+=1

		elif bits == 2:
			# end of stream token
			return empty.join(result)

		if bits < len(dictionary):
			entry = dictionary[bits] 
		else:
			entry = c + c[0]
		result.append(entry)
		dictionary.append(c + entry[0])
		dictSize+=1

		c = entry

		enlargeIn-=1
		if enlargeIn == 0:
			enlargeIn = 1 << numBits
			numBits+=1

#print (Ld(Lc("hi there hi there hi there hi there")))
