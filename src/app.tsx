import {
  Button,
  Callout,
  Dialog,
  DialogBody,
  DialogFooter,
  Spinner,
  TextArea,
} from '@blueprintjs/core';
import { groupBy } from 'lodash-es';
import React, { useEffect, useMemo, useState } from 'react';
import 'virtual:windi.css';
import {
  appendHighlightHeader,
  createBookPage,
  getBookPage,
  insertChapterHighlight,
} from './book';
import { Note, parseWxreadNotes } from './parser';

export async function importNotes(notes: Note) {
  const { bookName, author, children } = notes;
  const exists = await getBookPage(bookName);
  if (!exists && notes.children.length > 0) {
    const page = await createBookPage(bookName, author);

    const highlightHeader = await appendHighlightHeader(page!);
    const chapterGroups = groupBy(children, 'chapterName');
    const chapterNames = Object.keys(chapterGroups);
    for (let i = 0, len = chapterNames.length; i < len; i += 1) {
      const chapterName = chapterNames[len - i - 1];
      await insertChapterHighlight(
        highlightHeader!,
        chapterName,
        chapterGroups[chapterName],
      );
    }

    await logseq.Editor.exitEditingMode(false);
  }
}

const App = () => {
  const [text, setText] = useState('');
  const [notes, setNotes] = useState<Note | undefined>();
  const [importing, setImporting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const importable = useMemo(() => {
    if (!notes || notes.children.length === 0) {
      return false;
    }
    return true;
  }, [notes]);

  useEffect(() => {
    const newNotes = parseWxreadNotes(text);
    setNotes(newNotes);

    getBookPage(newNotes.bookName).then((page) => {
      if (page) {
        setErrorMessage(`[[${page.name}]] 已存在`);
      }
    });
  }, [text]);

  const handleClose = () => {
    setText('');
    setNotes(undefined);
    setImporting(false);
    setErrorMessage('');
    logseq.hideMainUI();
  };

  const handleImport = async () => {
    if (!notes) {
      return;
    }

    setImporting(true);
    await importNotes(notes);
    handleClose();
  };

  if (importing) {
    return (
      <div className="w-screen h-screen bg-black/75 flex justify-center items-center">
        <div>
          <Spinner intent="primary" className="mb-4" />
          <span className="text-md text-slate-100">
            正在导入《{notes?.bookName}》的{notes?.children.length} 条笔记...
          </span>
        </div>
      </div>
    );
  }

  return (
    <Dialog
      isOpen
      title="导入微信读书笔记"
      icon="info-sign"
      onClose={handleClose}
      canOutsideClickClose={false}
    >
      <DialogBody>
        <TextArea
          className="mb-3 !h-48"
          placeholder="从微信读书中复制笔记并粘贴到此处"
          onChange={(e) => setText(e.target.value)}
          value={text}
          fill
        />
        {(importable && !errorMessage) && (
          <Callout title={`《${notes!.bookName}》`}>
            <span className="block text-gray-500">作者：{notes!.author}</span>
            <span className="block text-gray-500">
              共 {notes!.children.length} 条笔记
            </span>
          </Callout>
        )}
        {(importable && errorMessage) && (
          <Callout className="!pl-15px" icon={false} intent="danger" title="无法导入">
            <span>{errorMessage}</span>
          </Callout>
        )}
      </DialogBody>
      <DialogFooter
        actions={
          <Button
            disabled={!importable || !!errorMessage}
            loading={importing}
            intent="primary"
            text="导入笔记"
            onClick={handleImport}
          />
        }
      />
    </Dialog>
  );
};

export default App;
