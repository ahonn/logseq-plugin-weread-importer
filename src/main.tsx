import '@logseq/libs';
import React from 'react';
import * as ReactDOM from 'react-dom/client';
import { logseq as plugin } from '../package.json';
import App from './app';
import settings from './settings';
import '@blueprintjs/core/lib/css/blueprint.css';

function createModel() {
  return {
    showImportDialog() {
      logseq.showMainUI();
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
        <a id="${plugin.id}" data-on-click="showImportDialog" data-rect class="button">
          <i class="ti ti-book" style="font-size: 20px"></i>
        </a>
      `,
    });

    const root = ReactDOM.createRoot(document.getElementById('app')!);
    root.render(<App />);
  } catch (e: any) {
    logseq.App.showMsg(e.message, 'error');
  }
}

logseq
  .useSettingsSchema(settings)
  .ready(createModel())
  .then(main)
  .catch(console.error);
