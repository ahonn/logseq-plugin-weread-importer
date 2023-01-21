import { SettingSchemaDesc } from "@logseq/libs/dist/LSPlugin";

export interface ISettings {
  pageName: string;
  pageProperties: Record<string, string>;
  highlightHeader: string;
  highlightNote: string;
}

const settings: SettingSchemaDesc[] = [
  {
    key: 'pageName',
    type: 'string',
    title: 'Page Name',
    description: 'Variables: {{title}}, {{author}}',
    default: '{{title}}',
  },
  {
    key: 'pageProperties',
    type: 'object',
    title: 'Page Properties',
    description: 'Variables: {{title}}, {{author}}, {{date}}',
    default: {
      author: '[[{{author}}]]',
      date: '[[{{date}}]]'
    },
  },
  {
    key: 'highlightHeader',
    type: 'string',
    title: 'Highlight Header',
    description: 'Variables: {{date}}',
    default: 'Highlights at [[{{date}}]]',
  },
  {
    key: 'highlightNote',
    type: 'string',
    title: 'Highlight Note',
    description: 'Variables: {{highlight_note}}',
    default: '{{highlight_note}}',
  },
];

export default settings;