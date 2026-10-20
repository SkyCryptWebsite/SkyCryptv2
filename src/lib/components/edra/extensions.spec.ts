import { getSchema } from "@tiptap/core";
import { Node } from "@tiptap/pm/model";
import { describe, it } from "vitest";
import { getContentExtensions, stripTransientNodes } from "./extensions";

describe("getContentExtensions", () => {
  const schema = getSchema(getContentExtensions());

  it("builds a schema with every persisted node", ({ expect }) => {
    for (const name of [
      "paragraph",
      "heading",
      "image",
      "callout",
      "iframe",
      "table",
      "codeBlock",
      "taskList",
      "video",
      "audio"
    ]) {
      expect(schema.nodes[name], name).toBeDefined();
    }
    expect(schema.nodes.mediaPlaceholder).toBeUndefined();
  });

  it("replaces media placeholders so editor output validates", ({ expect }) => {
    const doc = {
      type: "doc",
      content: [
        { type: "callout", content: [{ type: "paragraph" }] },
        { type: "mediaPlaceholder", attrs: { mediaType: "image" } }
      ]
    };
    expect(() => Node.fromJSON(schema, doc).check()).toThrow();
    expect(() => Node.fromJSON(schema, stripTransientNodes(doc)).check()).not.toThrow();
  });
});
