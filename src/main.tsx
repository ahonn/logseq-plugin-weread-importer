import '@logseq/libs';
import React from 'react';
import * as ReactDOM from 'react-dom/client';
import { groupBy } from 'lodash-es';
import { logseq as plugin } from '../package.json';
import { parseWxreadNotes } from './parser';
import App, { IApp } from './app';
import settings from './settings';
import {
  appendHighlightHeader,
  createBookPage,
  insertChapterHighlight,
} from './book';

let app: IApp | null = null;

function createModel() {
  return {
    async readClipboardContent() {
      logseq.showMainUI();
      const text = await window.navigator.clipboard.readText();
      const notes = parseWxreadNotes(text);
      const { bookName, author } = notes;

      const exists = await logseq.Editor.getPage(bookName);
      if (!exists && notes.children.length > 0) {
        app!.setProgressMessage(`Creating Page: ${bookName}`);
        const page = await createBookPage(bookName, author);

        app!.setProgressMessage(`Importing Note from ${bookName}`);
        const highlightHeader = await appendHighlightHeader(page!);

        const chapterGroups = groupBy(notes.children, 'chapterName');
        const chapterNames = Object.keys(chapterGroups);
        for (let i = 0, len = chapterNames.length; i < len; i += 1) {
          const chapterName = chapterNames[len - i - 1];
          app!.setProgressMessage(
            `Importing Note from ${bookName}, ${(((i + 1) / len) * 100).toFixed(
              2,
            )}%`,
          );
          await insertChapterHighlight(
            highlightHeader!,
            chapterName,
            chapterGroups[chapterName],
          );
        }

        await logseq.Editor.exitEditingMode();
      }

      app!.setProgressMessage('Import Successfully');
      logseq.hideMainUI();
    },
  };
}

function main() {
  try {
    logseq.setMainUIInlineStyle({
      position: 'fixed',
      zIndex: 11,
    });

    logseq.App.registerUIItem('toolbar', {
      key: plugin.id,
      template: `
        <a id="${plugin.id}" data-on-click="readClipboardContent" data-rect class="button">
          <i class="ti ti-book" style="font-size: 20px"></i>
        </a>
      `,
    });

    const root = ReactDOM.createRoot(document.getElementById('app')!);
    root.render(
      <React.StrictMode>
        <App ref={(ref: IApp) => (app = ref)} />
      </React.StrictMode>,
    );
  } catch (e: any) {
    logseq.App.showMsg(e.message, 'error');
  }
}

logseq
  .useSettingsSchema(settings)
  .ready(createModel())
  .then(main)
  .catch(console.error);
