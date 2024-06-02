class TagParsingException extends Error {
	constructor(baseString, offset, message) {
		super(`${message} at ${offset} in \`${baseString}\`.`);
		this.baseString = baseString;
		this.offset = offset;
		this.message = message;
	}
}

class StringRacer {
	constructor(backing) {
		this.backing = backing;
		this.idx = 0;
		this.stack = [];
	}

	pushState() {
		this.stack.push(this.idx);
	}

	popState() {
		this.idx = this.stack.pop();
	}

	discardState() {
		this.stack.pop();
	}

	peek(count) {
		return this.backing.substring(this.idx, this.idx + count);
	}

	finished() {
		return this.peek(1).length === 0;
	}

	peekReq(count) {
		const peeked = this.peek(count);

		return peeked.length === count ? peeked : null;
	}

	consumeCountReq(count) {
		const peeked = this.peekReq(count);
		if (peeked !== null) {
			this.idx += count;
		}

		return peeked;
	}

	tryConsume(string) {
		if (this.peek(string.length) === string) {
			this.idx += string.length;
			return true;
		}

		return false;
	}

	consumeWhile(conditionFn) {
		let consumed = '';
		while (conditionFn(consumed + this.peek(1))) {
			consumed += this.peek(1);
			this.idx++;
		}

		return consumed;
	}

	expect(string, errorMessage) {
		if (!this.tryConsume(string)) {
			this.error(errorMessage);
		}
	}

	error(errorMessage) {
		throw new TagParsingException(this.backing, this.idx, errorMessage);
	}
}

class NBTTagParser {
	constructor(string) {
		this.racer = new StringRacer(string);
		this.baseTag = this.parseTag();
	}

	static get digitRange() {
		return '0123456789-';
	}

	static parse(string) {
		return new NBTTagParser(string).baseTag;
	}

	skipWhitespace() {
		this.racer.consumeWhile((s) => /\s/.test(s[s.length - 1]));
	}

	parseTag() {
		this.skipWhitespace();
		this.racer.expect('{', "Expected '{' at start of tag");
		this.skipWhitespace();
		const tag = {};
		while (!this.racer.tryConsume('}')) {
			this.skipWhitespace();
			const key = this.parseIdentifier();
			this.skipWhitespace();
			this.racer.expect(':', "Expected ':' after identifier in tag");
			this.skipWhitespace();
			const value = this.parseAny();
			tag[key] = value;
			this.racer.tryConsume(',');
			this.skipWhitespace();
		}

		return tag;
	}

	parseAny() {
		this.skipWhitespace();
		const nextChar = this.racer.peekReq(1) || this.racer.error('Expected new object, found EOF');
		if (nextChar === '{') {
			return this.parseTag();
		} else if (nextChar === '[') {
			return this.parseList();
		} else if (nextChar === '"') {
			return this.parseStringTag();
		} else if (NBTTagParser.digitRange.includes(nextChar)) {
			return this.parseNumericTag();
		}

		this.racer.error('Unexpected token found. Expected start of new element');
	}

	parseList() {
		this.skipWhitespace();
		this.racer.expect('[', "Expected '[' at start of tag");
		this.skipWhitespace();
		const list = [];
		while (!this.racer.tryConsume(']')) {
			this.skipWhitespace();
			this.racer.pushState();
			const maybeIndex = this.racer.consumeWhile((s) => s.split('').every((c) => NBTTagParser.digitRange.includes(c)));
			this.skipWhitespace();
			if (!this.racer.tryConsume(':') || maybeIndex.length === 0) {
				this.racer.popState();
				list.push(this.parseAny());
			} else {
				this.racer.discardState();
				this.skipWhitespace();
				list.push(this.parseAny());
			}

			this.skipWhitespace();
			this.racer.tryConsume(',');
		}
		return list;
	}

	parseQuotedString() {
		this.skipWhitespace();
		this.racer.expect('"', "Expected '\"' at string start");
		let result = '';
		// eslint-disable-next-line no-constant-condition
		while (true) {
			const char = this.racer.consumeCountReq(1);
			if (char === '"') {
				return result;
			}

			if (char === '\\') {
				const escaped = this.racer.consumeCountReq(1) || this.racer.error('Unfinished backslash escape');
				if (escaped !== '"' && escaped !== '\\') {
					this.racer.idx--;
					this.racer.error(`Invalid backslash escape '${escaped}'`);
				}

				result += escaped;
			} else if (char === null) {
				this.racer.error('Unfinished string');
			} else {
				result += char;
			}
		}
	}

	parseStringTag() {
		return this.parseQuotedString();
	}

	parseNumericTag() {
		this.skipWhitespace();
		const text = this.racer.consumeWhile((s) => NBTTagParser.Patterns.ROUGH_PATTERN.test(s));
		if (text.length === 0) {
			this.racer.error('Expected numeric tag (starting with either -, +, . or a digit)');
		}

		for (const [, regex] of Object.entries(NBTTagParser.Patterns)) {
			const match = regex.exec(text);
			if (match) {
				return match[1];
			}
		}

		throw new Error(`Could not properly parse numeric tag '${text}', despite passing verification. BAD DEV`);
	}

	parseIdentifier() {
		this.skipWhitespace();
		if (this.racer.peek(1) === '"') {
			return this.parseQuotedString();
		}

		return this.racer.consumeWhile((s) => s[s.length - 1] !== ':' && !/\s/.test(s[s.length - 1]));
	}
}

NBTTagParser.Patterns = {
	DOUBLE: /([-+]?[0-9]*\.?[0-9]+)[dD]/,
	FLOAT: /([-+]?[0-9]*\.?[0-9]+)[fF]/,
	BYTE: /([-+]?[0-9]+)[bB]/,
	LONG: /([-+]?[0-9]+)[lL]/,
	SHORT: /([-+]?[0-9]+)[sS]/,
	INTEGER: /([-+]?[0-9]+)/,
	DOUBLE_UNTYPED: /([-+]?[0-9]*\.?[0-9]+)/,
	ROUGH_PATTERN: /^[-+]?[0-9]*\.?[0-9]*[dDbBfFlLsS]?$/
};

const result = NBTTagParser.parse(
	'{HideFlags:254,SkullOwner:{Id:"da4494c1-1a56-4cf1-b4e4-d2be6e55ea0b",hypixelPopulated:1b,Properties:{textures:[0:{Value:"eyJ0ZXh0dXJlcyI6eyJTS0lOIjp7InVybCI6Imh0dHA6Ly90ZXh0dXJlcy5taW5lY3JhZnQubmV0L3RleHR1cmUvYTNjMTUzYzM5MWMzNGUyZDMyOGE2MDgzOWU2ODNhOWY4MmFkMzA0ODI5OWQ4YmM2YTM5ZTZmOTE1Y2M1YSJ9fX0\u003d"}]},Name:"§da4494c1-1a56-4cf1-b4e4-d2be6e55ea0b"},display:{Lore:[0:"§7Mining Wisdom: §a+1.5",1:"",2:"§7§7Grants §6+1 Magical Power §7per §a2",3:"§a§7contacts in your Abiphone.",4:"",5:"§7§8Only ONE case will have an effect",6:"§8while in accessory bag.",7:"",8:"§9§lRARE ACCESSORY",9:"",10:"§7Cost",11:"§b17,000 Bits"],Name:"§9Actually Blue™ Abicase"},ExtraAttributes:{model:"BLUE_BLUE",id:"ABICASE_BLUE_BLUE"}}'
);

console.log(result);
