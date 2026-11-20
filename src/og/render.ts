/// <reference types="node" />
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import satori from 'satori';
import sharp from 'sharp';
import { OG_IMAGE_HEIGHT, OG_IMAGE_WIDTH, SITE_NAME } from '../consts';

export interface OgContent {
  tagline: string;
  label: string;
  headingLines: string[];
  pageName: string;
  dateLabel: string;
  slots: string[];
}

const FONT_SANS = 'Zen Kaku Gothic New';
const FONT_SERIF = 'Shippori Mincho B1';
const FONT_ACCENT = 'Cormorant Garamond';
const FONT_SANS_WEIGHT = 500;
const FONT_SERIF_WEIGHT = 600;
const FONT_ACCENT_WEIGHT = 500;

const COLOR_BACKGROUND = '#F4F8FD';
const COLOR_SURFACE = '#FFFFFF';
const COLOR_SKY = '#E6F0FA';
const COLOR_TEXT = '#1E2733';
const COLOR_SUB = '#5E6873';
const COLOR_FREE = '#56688F';
const COLOR_ACCENT = '#2E3B57';

const PADDING_X = 80;
const PADDING_Y = 64;
const COLUMN_GAP = 48;
const LOGO_SIZE = 52;
const LOGO_GAP = 14;
const SITE_NAME_FONT_SIZE = 30;
const LABEL_FONT_SIZE = 20;
const TAGLINE_FONT_SIZE = 30;
const HEADING_FONT_SIZE = 50;
const HEADING_LINE_HEIGHT = 1.45;
const COPY_GAP = 22;
// satori の幅は余白を含まないので、中身の幅で指定する
const CARD_CONTENT_WIDTH = 270;
const CARD_PADDING = 30;
const CARD_RADIUS = 32;
const CARD_GAP = 18;
const CARD_HEAD_GAP = 2;
const PAGE_NAME_FONT_SIZE = 18;
const DATE_FONT_SIZE = 24;
const CHIP_FONT_SIZE = 28;
const CHIP_WIDTH = 130;
const CHIP_PADDING_Y = 4;
const CHIP_RADIUS = 999;
const CHIP_GAP = 10;

const FONT_CSS_URL = 'https://fonts.googleapis.com/css2';
const FONT_SOURCE_PATTERN = /src: url\((.+?)\) format\('(?:opentype|truetype)'\)/;
const FONT_FETCH_TIMEOUT_MS = 15000;

async function fetchOk(url: string, what: string) {
  const response = await fetch(url, { signal: AbortSignal.timeout(FONT_FETCH_TIMEOUT_MS) });
  if (!response.ok) {
    throw new Error(`OGP 画像に使う${what}を取得できませんでした（${response.status}）: ${(await response.text()).slice(0, 200)}`);
  }
  return response;
}

// 明朝体を丸ごとリポジトリに置くと 15MB になるため、画像に使う文字だけをビルド時に Google Fonts から取る
const fontCache = new Map<string, Promise<ArrayBuffer>>();
function fetchFontSubset(family: string, axis: string, text: string) {
  const params = new URLSearchParams({ family: `${family}:${axis}`, text: [...new Set(text)].join('') });
  const url = `${FONT_CSS_URL}?${params}`;
  const cached = fontCache.get(url);
  if (cached) return cached;
  const font = (async () => {
    const css = await (await fetchOk(url, `フォント ${family} の CSS`)).text();
    const source = css.match(FONT_SOURCE_PATTERN)?.[1];
    if (!source) {
      throw new Error(`OGP 画像に使うフォント ${family} の CSS に、TrueType のファイルが見つかりませんでした`);
    }
    return (await fetchOk(source, `フォント ${family} のファイル`)).arrayBuffer();
  })();
  fontCache.set(url, font);
  // 失敗した取得を使い回すと、開発サーバーで一度失敗したあと二度と取り直さなくなる
  font.catch(() => fontCache.delete(url));
  return font;
}

// カレントディレクトリ基準にするのは、ビルド後の import.meta.url が位置を保たないため
async function loadLogoDataUri() {
  const svg = await readFile(resolve('public/images/logo.svg'));
  return `data:image/svg+xml;base64,${svg.toString('base64')}`;
}

function box(style: Record<string, unknown>, children?: unknown) {
  return { type: 'div', props: { style: { display: 'flex', ...style }, children } };
}

function layout(content: OgContent, logoDataUri: string) {
  const chip = (slot: string) =>
    box(
      {
        width: CHIP_WIDTH,
        justifyContent: 'center',
        padding: `${CHIP_PADDING_Y}px 0`,
        borderRadius: CHIP_RADIUS,
        background: COLOR_SKY,
        color: COLOR_FREE,
        fontFamily: FONT_ACCENT,
        fontStyle: 'italic',
        fontSize: CHIP_FONT_SIZE,
      },
      slot,
    );

  return box({ width: '100%', height: '100%', background: COLOR_BACKGROUND, color: COLOR_TEXT, fontFamily: FONT_SANS }, [
    box(
      {
        flexGrow: 1,
        flexDirection: 'column',
        justifyContent: 'space-between',
        margin: `${PADDING_Y}px ${PADDING_X}px`,
      },
      [
      box({ alignItems: 'center', justifyContent: 'space-between' }, [
        box({ alignItems: 'center', gap: LOGO_GAP, fontSize: SITE_NAME_FONT_SIZE }, [
          { type: 'img', props: { src: logoDataUri, width: LOGO_SIZE, height: LOGO_SIZE } },
          box({}, SITE_NAME),
        ]),
        box({ fontSize: LABEL_FONT_SIZE, color: COLOR_SUB }, content.label),
      ]),
      box({ flexGrow: 1, alignItems: 'center', justifyContent: 'space-between', gap: COLUMN_GAP }, [
        box({ flexDirection: 'column', gap: COPY_GAP }, [
          box({ fontFamily: FONT_ACCENT, fontStyle: 'italic', fontSize: TAGLINE_FONT_SIZE, color: COLOR_ACCENT }, content.tagline),
          // satori は日本語を文節で折り返せないため、改行位置は呼び出し側で行ごとに渡す
          box(
            { flexDirection: 'column', fontFamily: FONT_SERIF, fontSize: HEADING_FONT_SIZE, lineHeight: HEADING_LINE_HEIGHT },
            content.headingLines.map((line) => box({ whiteSpace: 'nowrap' }, line)),
          ),
        ]),
        box(
          {
            width: CARD_CONTENT_WIDTH,
            flexShrink: 0,
            flexDirection: 'column',
            gap: CARD_GAP,
            padding: CARD_PADDING,
            borderRadius: CARD_RADIUS,
            background: COLOR_SURFACE,
          },
          [
            box({ flexDirection: 'column', gap: CARD_HEAD_GAP }, [
              box({ fontFamily: FONT_ACCENT, fontStyle: 'italic', fontSize: DATE_FONT_SIZE, color: COLOR_ACCENT }, content.dateLabel),
              box({ fontSize: PAGE_NAME_FONT_SIZE, color: COLOR_ACCENT, whiteSpace: 'nowrap' }, content.pageName),
            ]),
            box({ flexWrap: 'wrap', gap: CHIP_GAP }, content.slots.map(chip)),
          ],
        ),
      ]),
      ],
    ),
  ]);
}

export async function renderOgImage(content: OgContent): Promise<Uint8Array<ArrayBuffer>> {
  const [sans, serif, accent, logoDataUri] = await Promise.all([
    fetchFontSubset(FONT_SANS, `wght@${FONT_SANS_WEIGHT}`, SITE_NAME + content.label + content.pageName),
    fetchFontSubset(FONT_SERIF, `wght@${FONT_SERIF_WEIGHT}`, content.headingLines.join('')),
    fetchFontSubset(FONT_ACCENT, `ital,wght@1,${FONT_ACCENT_WEIGHT}`, content.tagline + content.dateLabel + content.slots.join('')),
    loadLogoDataUri(),
  ]);
  const svg = await satori(layout(content, logoDataUri) as Parameters<typeof satori>[0], {
    width: OG_IMAGE_WIDTH,
    height: OG_IMAGE_HEIGHT,
    fonts: [
      { name: FONT_SANS, data: sans, weight: FONT_SANS_WEIGHT, style: 'normal' },
      { name: FONT_SERIF, data: serif, weight: FONT_SERIF_WEIGHT, style: 'normal' },
      { name: FONT_ACCENT, data: accent, weight: FONT_ACCENT_WEIGHT, style: 'italic' },
    ],
  });
  const png = await sharp(Buffer.from(svg)).png().toBuffer();
  return new Uint8Array(png);
}
