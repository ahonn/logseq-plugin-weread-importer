import '@logseq/libs';
import { logseq as plugin } from '../package.json';
import { parseWxreadNotes } from './parser';
import dayjs from 'dayjs';
import { groupBy } from 'lodash-es';

function createModel() {
  return {
    async readClipboardContent() {
      logseq.showMainUI();
      const text = await window.navigator.clipboard.readText();
      const notes = parseWxreadNotes(text);
      const { bookName, author } = notes;

      const exists = await logseq.Editor.getPage(bookName)
      if (!exists) {
        const date = dayjs(new Date()).format('YYYY/MM/DD');
        const page = await logseq.Editor.createPage(bookName, {
          author: `[[${author}]]`,
          date: `[[${date}]]`,
        });

        const highlightBlock = await logseq.Editor.appendBlockInPage(page!.uuid, 'Highlights');

        const chapterGroups = groupBy(notes.children, 'chapterName');
        for (const chapterName of Object.keys(chapterGroups)) {
          console.log(chapterName)
          const chapterBlock = await logseq.Editor.insertBlock(highlightBlock!.uuid, chapterName);
          for (const note of chapterGroups[chapterName]) {
            const highlightBlock = await logseq.Editor.insertBlock(chapterBlock!.uuid, note.highlight);
            if (note.sideNote) {
              await logseq.Editor.insertBlock(highlightBlock!.uuid, `Note: ` + note.sideNote.replace(/\n/, ''));
            }
          }
        }
      }

      console.log(notes);
      logseq.hideMainUI();
    }
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
  } catch (e: any) {
    logseq.App.showMsg(e.message, 'error');
  }
}

logseq
  .ready(createModel())
  .then(main)
  .catch(console.error);