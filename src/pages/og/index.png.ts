import { renderOgImage } from '../../og/render';
import { freeSlotsOf, NOMINATED, pageName, sampleDateLabel, slotLabel } from '../../sampleSchedule';

const OG_SLOT_COUNT = 4;

export async function GET() {
  const png = await renderOgImage({
    tagline: 'Reservations for the person you choose',
    label: '担当を指名して予約できる予約受付サービス',
    headingLines: ['その予約', 'まだ DM で受けていますか'],
    pageName: pageName(NOMINATED),
    dateLabel: sampleDateLabel(),
    slots: freeSlotsOf(NOMINATED).slice(0, OG_SLOT_COUNT).map(slotLabel),
  });
  return new Response(png, { headers: { 'Content-Type': 'image/png' } });
}
