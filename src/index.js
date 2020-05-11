const BEFORE   = 1,
	  IN_KEY   = 2,
	  IN_VALUE = 3,
	  END      = 4;
	  
const DEFAULT_SIGIL = ':';
const EMPTY_STRING  = "";
 
class SearchFilterOptions {
	
	static getReader (string) {
		let str = string, i = 0;
		return () => {
			return str.charAt(i++);
		}
	}
	
	fillExtra () {
		this.out.extra = this.str.substring(this.p, this.anc);
		this.p = this.anc;
	}

	fillKey () {
		this.anc++;
		let key = this.str.substring(this.p + 1, this.anc);
		this.curKey = key;
		this.out.data[this.curKey] = {
			exists: true,
			value:  null
		};
		this.p = this.anc;
	}
	
	fillValue () {
		this.anc++;
		let val = this.str.substring(this.p + 1, this.anc);
		this.out.data[this.curKey].value = val;
		this.p = this.anc;
	}
	
	static checkSigil (sigil) {
		if (typeof(sigil) !== 'string' || sigil.length != 1) {
			throw new TypeError(`SearchFilterOptions.construtor checkSigil error: sigil option must be char, but ${sigil} found`);
		}
	}
	
	static checkKeys (keys) {
		if (!Array.isArray(keys)) {
			throw new TypeError(`SearchFilterOptions.constructor checkKeys error: keys option must be array, but ${keys} found`);
		}
	}
	
	constructor ({ sigil = DEFAULT_SIGIL, keys = [], trim = true } = {}) {
		SearchFilterOptions.checkSigil(sigil);
		SearchFilterOptions.checkKeys(keys);

		this.sig  = sigil;
		this.keys = keys;
		this.trim = !!trim;

		this.reset();
	}
	
	reset () {
		this.out = {
			expected: {},
			data: {},
			extra: ''
		};
		this.p = 0;
		this.anc = 0;
		this.curKey = null;
		for (let item of this.keys) {
			this.out.expected[item.name] = {
				exists: false,
				value:  null,
				flag:   !!item.flag
			}
		}
	}
	
	compare () {
		for (let [k, v] of Object.entries(this.out.expected)) {
			if (this.out.data.hasOwnProperty(k)) {
				if (v.flag) {
					this.out.expected[k].value = true;
				} else {
					this.out.expected[k].value = this.out.data[k].value;
				}
			} else {
				if (v.flag) {
					this.out.expected[k].value = false;
				}
			}
		}
	}
	
	postProcess () {
		if (this.trim) {
			this.out.extra = this.out.extra.trim();
			for (let item of Object.values(this.out.data)) {
				if (item.value !== null) {
					item.value = item.value.trim();
				}
			}
		}
	}
	
	getKeys () {
		return this.keys;
	}
	
	getExpected () {
		return this.out.expected;
	}
	
	getString () {
		return this.str;
	}
	
	parse (str) {
		if (typeof(str) !== 'string') {
			throw new TypeError(`SearchFilterOptions.parse error: expected string, but found ${str}`);
		}
		this.str = str;
		let read = SearchFilterOptions.getReader(this.str);
		let notFinished = true, c, state = BEFORE;
		do {
			switch (state) {
			case BEFORE:
				c = read();
				switch (c) {
				case EMPTY_STRING:
					this.fillExtra();
					state = END;
					break;
				case this.sig:
					this.fillExtra();
					state = IN_KEY;
					break;
				default:
					this.anc++;
					break;
				}
				break;
			case IN_KEY:
				c = read();
				if (c === EMPTY_STRING) {
					this.fillKey();
					state = END;
				} else if (/\s/.test(c)) {
					this.fillKey();
					state = IN_VALUE;
				} else {
					this.anc++;
				}
				break;
			case IN_VALUE:
				c = read();
				switch (c) {
				case EMPTY_STRING:
					this.fillValue();
					state = END;
					break;
				case this.sig:
					this.fillValue();
					state = IN_KEY;
					break;
				default:
					this.anc++;
					break;
				}
				break;
			case END:
				notFinished = false;
				break;
			}
		} while (notFinished);
		this.postProcess();
		this.compare();
		return this.out;
	}
	
}

module.exports.SearchFilterOptions = SearchFilterOptions;