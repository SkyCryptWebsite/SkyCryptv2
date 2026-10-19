import {
  mergeAttributes,
  Node,
  wrappingInputRule,
  type JSONContent,
  type MarkdownLexerConfiguration,
  type MarkdownParseHelpers,
  type MarkdownRendererHelpers,
  type MarkdownToken
} from "@tiptap/core";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    callout: {
      setCallout: () => ReturnType;
    };
  }
}

/** Base callout node; the editor adds its Svelte node view in `shadcn/editor.ts`. */
export const Callout = Node.create({
  name: "callout",
  content: "paragraph+",
  group: "block",
  defining: true,
  selectable: true,
  draggable: true,

  addAttributes() {
    return {
      emoji: {
        default: "💡"
      }
    };
  },

  markdownTokenizer: {
    name: "callout",
    level: "block",

    start: (src: string) => {
      return src.indexOf("$");
    },

    tokenize: (src: string, _tokens: MarkdownToken[], lexer: MarkdownLexerConfiguration) => {
      // Match $callout[emoji]\ncontent\n$
      const match = /^\$callout\s*(.*)?\n([\s\S]*?)\n\$/.exec(src);

      if (!match) {
        return undefined;
      }

      return {
        type: "callout",
        raw: match[0],
        emoji: match[1]?.trim() || "💡",
        text: match[2],
        tokens: lexer.blockTokens(match[2])
      };
    }
  },

  parseMarkdown: (token: MarkdownToken, helpers: MarkdownParseHelpers) => {
    return {
      type: "callout",
      attrs: {
        emoji: token.emoji
      },
      content: helpers.parseChildren(token.tokens || [])
    };
  },

  renderMarkdown: (node: JSONContent, helpers: MarkdownRendererHelpers) => {
    const content = helpers.renderChildren(node);
    const emoji = node.attrs?.emoji || "💡";
    return `$callout${emoji}\n${content}\n$\n\n`;
  },

  addOptions() {
    return {
      HTMLAttributes: {
        class: "callout"
      }
    };
  },

  parseHTML() {
    return [{ tag: "div[class=callout]" }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["div", mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0];
  },

  addCommands() {
    return {
      setCallout:
        () =>
        ({ commands, editor }) => {
          const { type = null } = editor.getAttributes(this.name);
          if (type) {
            return commands.lift(this.name);
          } else {
            return commands.toggleWrap(this.name);
          }
        }
    };
  },

  addInputRules() {
    return [
      wrappingInputRule({
        find: /^\$callout\s*(.*)?\s$/,
        type: this.type,
        getAttributes: (match) => {
          return { emoji: match[1]?.trim() || "💡" };
        }
      })
    ];
  }
});
