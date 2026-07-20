import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(customParseFormat);

/** Same visual pattern as Angular momentFormat:'DD MMM YYYY HH:mm' */
export function formatTaigaDate(iso: string | undefined | null): string {
  if (!iso) return '';
  const d = dayjs(iso);
  return d.isValid() ? d.format('DD MMM YYYY HH:mm') : String(iso);
}
