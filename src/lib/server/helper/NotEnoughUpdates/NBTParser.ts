class TagParsingException extends Error {
  baseString: string;
  offset: number;
  constructor(baseString: string, offset: number, message: string) {
    super(`${message} at ${offset} in \`${baseString}\`.`);
    this.baseString = baseString;
    this.offset = offset;
    this.message = message;
  }
}

class StringRacer {
  backing: string;
  idx: number;
  stack: number[];
  constructor(backing: string) {
    this.backing = backing;
    this.idx = 0;
    this.stack = [];
  }

  pushState() {
    this.stack.push(this.idx);
  }

  popState() {
    this.idx = this.stack.pop() as number;
  }

  discardState() {
    this.stack.pop();
  }

  peek(count: number) {
    return this.backing.substring(this.idx, this.idx + count);
  }

  finished() {
    return this.peek(1).length === 0;
  }

  peekReq(count: number) {
    const peeked = this.peek(count);

    return peeked.length === count ? peeked : null;
  }

  consumeCountReq(count: number) {
    const peeked = this.peekReq(count);
    if (peeked !== null) {
      this.idx += count;
    }

    return peeked;
  }

  tryConsume(string: string) {
    if (this.peek(string.length) === string) {
      this.idx += string.length;
      return true;
    }

    return false;
  }

  consumeWhile(conditionFn: typeof Function | ((s: string) => boolean)) {
    let consumed = "";
    while (conditionFn(consumed + this.peek(1))) {
      consumed += this.peek(1);
      this.idx++;
    }

    return consumed;
  }

  expect(string: string, errorMessage: string) {
    if (!this.tryConsume(string)) {
      this.error(errorMessage);
    }
  }

  error(errorMessage: string) {
    throw new TagParsingException(this.backing, this.idx, errorMessage);
  }
}

class NBTTagParser {
  racer: StringRacer;
  baseTag: object;
  static Patterns: Record<string, RegExp>;
  constructor(string: string) {
    this.racer = new StringRacer(string);
    this.baseTag = this.parseTag();
  }

  static get digitRange() {
    return "0123456789-";
  }

  static parse(string: string) {
    return new NBTTagParser(string).baseTag;
  }

  skipWhitespace() {
    this.racer.consumeWhile((s: string) => /\s/.test(s[s.length - 1]));
  }

  parseTag() {
    this.skipWhitespace();
    this.racer.expect("{", "Expected '{' at start of tag");
    this.skipWhitespace();
    const tag = {} as Record<string, unknown>;
    while (!this.racer.tryConsume("}")) {
      this.skipWhitespace();
      const key = this.parseIdentifier();
      this.skipWhitespace();
      this.racer.expect(":", "Expected ':' after identifier in tag");
      this.skipWhitespace();
      const value = this.parseAny();
      tag[key] = value;
      this.racer.tryConsume(",");
      this.skipWhitespace();
    }

    return tag;
  }

  parseAny() {
    this.skipWhitespace();
    const nextChar = this.racer.peekReq(1) || this.racer.error("Expected new object, found EOF");
    if (nextChar === "{") {
      return this.parseTag();
    } else if (nextChar === "[") {
      return this.parseList();
    } else if (nextChar === '"') {
      return this.parseStringTag();
    } else if (NBTTagParser.digitRange.includes(nextChar as string)) {
      return this.parseNumericTag();
    }

    this.racer.error("Unexpected token found. Expected start of new element");
  }

  parseList() {
    this.skipWhitespace();
    this.racer.expect("[", "Expected '[' at start of tag");
    this.skipWhitespace();
    const list = [] as string[];
    while (!this.racer.tryConsume("]")) {
      this.skipWhitespace();
      this.racer.pushState();
      const maybeIndex = this.racer.consumeWhile((s: string) => s.split("").every((c: string) => NBTTagParser.digitRange.includes(c)));
      this.skipWhitespace();
      if (!this.racer.tryConsume(":") || maybeIndex.length === 0) {
        this.racer.popState();
        list.push(this.parseAny() as string);
      } else {
        this.racer.discardState();
        this.skipWhitespace();
        list.push(this.parseAny() as string);
      }

      this.skipWhitespace();
      this.racer.tryConsume(",");
    }
    return list;
  }

  parseQuotedString() {
    this.skipWhitespace();
    this.racer.expect('"', "Expected '\"' at string start");
    let result = "";

    while (true) {
      const char = this.racer.consumeCountReq(1);
      if (char === '"') {
        return result;
      }

      if (char === "\\") {
        const escaped = this.racer.consumeCountReq(1) || this.racer.error("Unfinished backslash escape");
        if (escaped !== '"' && escaped !== "\\") {
          this.racer.idx--;
          this.racer.error(`Invalid backslash escape '${escaped}'`);
        }

        result += escaped;
      } else if (char === null) {
        this.racer.error("Unfinished string");
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
    const text = this.racer.consumeWhile((s: string) => NBTTagParser.Patterns.ROUGH_PATTERN.test(s));
    if (text.length === 0) {
      this.racer.error("Expected numeric tag (starting with either -, +, . or a digit)");
    }

    for (const [, regex] of Object.entries(NBTTagParser.Patterns)) {
      const match = (regex as RegExp).exec(text);
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

    return this.racer.consumeWhile((s: string) => s[s.length - 1] !== ":" && !/\s/.test(s[s.length - 1]));
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

export const NBTParser = NBTTagParser;
