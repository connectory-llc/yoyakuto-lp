import { SITE_NAME } from '../../consts';
import { renderOgImage } from '../../og/render';
import { freeSlotsOf, NOMINATED, slotLabel } from '../../sampleSchedule';

const OG_LABEL = `${SITE_NAME} 担当を指名して予約できる予約受付サービス`;
const OG_HEADING_LINES = ['その予約', 'まだ DM で受けていますか'];
const OG_SLOT_COUNT = 4;
const OG_SLOTS = freeSlotsOf(NOMINATED).slice(0, OG_SLOT_COUNT).map(slotLabel);

export async function GET() {
  return new Response(await renderOgImage(OG_LABEL, OG_HEADING_LINES, OG_SLOTS), {
    headers: { 'Content-Type': 'image/png' },
  });
}
