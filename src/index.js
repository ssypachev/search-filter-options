const BEFORE   = 1,
      IN_KEY   = 2,
      IN_VALUE = 3,
      END      = 4;

const DEFAULT_SIGIL = ':';
const EMPTY_STRING  = "";

class SearchFilterOptions {

    fillExtra () {
        this.out.extra = this.str.substring(this.p, this.anc);
        this.p = this.anc;
    }

    fillKey () {
        let key = this.str.substring(this.p + 1, this.anc);
		if (key !== '') {
			this.curKey = key;
			this.out.data[this.curKey] = {
				value:  null
			};
		}
        this.p = this.anc;
    }

    fillValue () {
        let val = this.str.substring(this.p + 1, this.anc);
		if (this.trim && val.trim() !== '') {
			this.out.data[this.curKey].value = val;
		}
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

    makeExpected () {
        let out = {};
        for (let item of this.keys) {
            out[item.name] = {
                exists: false,
                value:  null,
                flag:   !!item.flag
            }
        }
        return out;
    }

    nextClean () {
        this.p = 0;
        this.anc = 0;
        this.curKey = null;
        this.out.data = {};
        for (let key of this.keys) {
            this.out.expected[key.name].exists = false;
            this.out.expected[key.name].value  = null;
        }
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
        this.out.expected = this.makeExpected();
		this.prevState = {
			str: ''
		};
    }

    compare () {
        for (let [k, v] of Object.entries(this.out.expected)) {
            if ({}.hasOwnProperty.call(this.out.data, k)) {
				this.out.expected[k].exists = true;
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
	
	saveState (state) {
		let self = this;
		this.prevState = {
			str:      self.str,
			out:      JSON.parse(JSON.stringify(self.out)),
			state,
			p:        self.p,
			anc:      self.anc,
			curKey:   self.curKey
		};
	}
	
	restorePrevState (state) {
		this.out    = JSON.parse(JSON.stringify(this.prevState.out));
		this.p      = this.prevState.p;
		this.anc    = this.prevState.anc;
		this.curKey = this.prevState.curKey;
		return this.prevState.state;
	}
	
	static isNextString (prev, next) {
		return prev !== '' && prev.length + 1 === next.length && next.startsWith(prev);
	}

    parse (str) {
        if (typeof(str) !== 'string') {
            throw new TypeError(`SearchFilterOptions.parse error: expected string, but found ${str}`);
        }
		let c, state, notFinished = true;
		if (SearchFilterOptions.isNextString(this.prevState.str, str)) {
			state = this.restorePrevState();
		} else {
			this.nextClean();
			state = BEFORE;
		}
		this.str = str;
        do {
            switch (state) {
            case BEFORE:
                c = this.str.charAt(this.anc);
                switch (c) {
                case EMPTY_STRING:
					this.saveState(state);
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
                c = this.str.charAt(this.anc);
                if (c === EMPTY_STRING) {
					this.saveState(state);
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
                c = this.str.charAt(this.anc);
                switch (c) {
                case EMPTY_STRING:
					this.saveState(state);
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