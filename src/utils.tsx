export function fixPreferredDateFormat(preferredDateFormat: string) {
  const format = preferredDateFormat
    .replace('yyyy', 'YYYY')
    .replace('dd', 'DD')
    .replace('do', 'Do')
    .replace('EEEE', 'dddd')
    .replace('EEE', 'ddd')
    .replace('EE', 'dd')
    .replace('E', 'dd');
  return format;
}