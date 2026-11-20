import { SITE_NAME } from '../../consts';
import { renderOgImage } from '../../og/render';

const OG_LABEL = `${SITE_NAME} 担当を指名して予約できる予約受付サービス`;
const OG_HEADING_LINES = ['その予約', 'まだ DM で受けていますか'];
const OG_SLOTS = ['11:00', '13:00', '13:30', '15:30'];

export async function GET() {
  return new Response(await renderOgImage(OG_LABEL, OG_HEADING_LINES, OG_SLOTS), {
    headers: { 'Content-Type': 'image/png' },
  });
}
