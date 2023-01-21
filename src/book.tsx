import { ISettings } from "./settings";
import * as _ from 'lodash-es';
import dayjs from "dayjs";
import { fixPreferredDateFormat } from "./utils";
import { BlockEntity, IBatchBlock, PageEntity } from "@logseq/libs/dist/LSPlugin.user";
import { Note } from "./parser";

_.templateSettings.interpolate = /{{([\s\S]+?)}}/g;

export async function createBookPage(bookName: string, author: string) {
  const { pageName, pageProperties } = logseq.settings as unknown as ISettings
  const { preferredDateFormat } = await logseq.App.getUserConfigs();
  const dateFormat = fixPreferredDateFormat(preferredDateFormat);
  const page = await logseq.Editor.createPage(
    _.template(pageName)({ title: bookName }),
    Object.keys(pageProperties).reduce((props, key) => {
      // @ts-ignore
      props[key] = _.template(pageProperties[key])({
        author,
        date: dayjs(new Date()).format(dateFormat),
      });
      return props;
    }, {}),
  );
  return page;
}

export async function appendHighlightHeader(page: PageEntity) {
  const { highlightHeader } = logseq.settings as unknown as ISettings
  const { preferredDateFormat } = await logseq.App.getUserConfigs();
  const dateFormat = fixPreferredDateFormat(preferredDateFormat);
  const block = await logseq.Editor.appendBlockInPage(
    page!.uuid,
    _.template(highlightHeader)({
      date: dayjs(new Date()).format(dateFormat),
    })
  )
  return block;
}

export async function insertChapterHighlight(
  parentBlock: BlockEntity,
  chapterName: string,
  notes: Note['children'],
) {
  const { highlightNote } = logseq.settings as unknown as ISettings
  const batchBlock: IBatchBlock = {
    children: [] as IBatchBlock[],
    content: chapterName,
  };
  
  notes.forEach((note) => {
    const { highlight, sideNote } = note;
    batchBlock.children!.push({
      content: highlight,
      children: sideNote ? [{
        content: _.template(highlightNote)({
          highlight_note: sideNote,
        }),
     }] : [],
    });
  });
  
  await logseq.Editor.insertBatchBlock(parentBlock!.uuid, batchBlock, { sibling: false });
}