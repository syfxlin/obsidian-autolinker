import { MarkdownView, Notice, Plugin } from "obsidian";
import fm from "front-matter";

interface AutoLinkerSettings {
  options: string;
}

const DEFAULT_SETTINGS: AutoLinkerSettings = {
  options: "{}",
};

interface FontMatterAttributes {
  link_titles: string[] | undefined;
  aliases: string[] | undefined;
}

export default class AutoLinkerPlugin extends Plugin {
  settings: AutoLinkerSettings;

  async onload() {
    console.log("Loading AutoLinker");

    await this.loadSettings();

    this.addCommand({
      id: "autolinker-run",
      name: "Run",
      callback: () => this.runAutoLinker(),
      hotkeys: [
        {
          modifiers: ["Mod", "Alt"],
          key: "k",
        },
      ],
    });
  }

  onunload() {
    console.log("Unloading AutoLinker");
  }

  async runAutoLinker() {
    const view = this.app.workspace.activeLeaf.view;
    if (view instanceof MarkdownView) {
      // Do work here
      const editor = view.sourceMode.cmEditor;

      // Remember the cursor
      const cursor = editor.getCursor();

      const currentFile = this.app.workspace.getActiveFile();
      let text = editor.getSelection();
      if (!text) {
        new Notice("AutoLinker: you must select text");
        return;
      }

      try {
        const markdownFiles = this.app.vault.getMarkdownFiles();
        for (const markdownFile of markdownFiles) {
          const name = markdownFile.basename;
          text = this.findAndReplace(text, name);
        }
        const contents = await Promise.all(
          markdownFiles.map((f) => this.app.vault.read(f))
        );
        for (let i = 0; i < contents.length; i++) {
          const attributes: FontMatterAttributes = fm(contents[i])
            .attributes as FontMatterAttributes;
          if (attributes.aliases) {
            for (const alias of attributes.aliases) {
              text = this.findAndReplace(text, alias);
            }
          }
          if (attributes.link_titles) {
            for (const linkTitle of attributes.link_titles) {
              let filePath;
              if (markdownFiles[i].path === currentFile.path) {
                filePath = "";
              } else {
                filePath = markdownFiles[i].basename;
              }
              text = this.findAndReplace(
                text,
                linkTitle,
                filePath + "#" + linkTitle
              );
            }
          }
        }
        new Notice("AutoLinker: linked");
        editor.replaceSelection(text, "start");
        editor.setCursor(cursor);
      } catch (e) {
        console.error(e);
        if (e.message) {
          new Notice(e.message);
        }
      }
    }
  }

  findAndReplace(text: string, name: string, link?: string) {
    const index = text.indexOf(name);
    if (index != -1) {
      const length = name.length;
      const leftOpenTag = text.substring(0, index).lastIndexOf("[[");
      const leftCloseTag = text.substring(0, index).lastIndexOf("]]");
      const rightOpenTag = text.indexOf("[[", index);
      const rightCloseTag = text.indexOf("]]", index);
      if (leftOpenTag !== -1 && rightCloseTag !== -1) {
        if (leftOpenTag === -1 && rightCloseTag < rightOpenTag) {
          return text;
        }
        if (rightOpenTag === -1 && leftCloseTag < leftOpenTag) {
          return text;
        }
        if (leftCloseTag < leftOpenTag && rightCloseTag < rightOpenTag) {
          return text;
        }
      }
      let replace;
      if (link) {
        replace = link + "|" + text.substring(index, index + length);
      } else {
        replace = text.substring(index, index + length);
      }
      text =
        text.substring(0, index) +
        "[[" +
        replace +
        "]]" +
        text.substring(index + length);
    }
    return text;
  }

  async loadSettings() {
    this.settings = Object.assign(DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }
}
