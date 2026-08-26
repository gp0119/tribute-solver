import type { CSSProperties } from 'react';

import { COLOR_BY_ID, type ColorId, type Score } from '../lib/tribute';

export function ColorChip({ colorId, small = false }: { colorId: ColorId; small?: boolean }) {
  const color = COLOR_BY_ID.get(colorId)!;
  return (
    <span className={small ? 'color-chip color-chip-small' : 'color-chip'} role="img" aria-label={color.name}>
      <span aria-hidden="true" className="color-swatch" style={{ '--gem-image': `url(${color.image})` } as CSSProperties} />
    </span>
  );
}

export function CodeChips({ code, small = false }: { code: ColorId[]; small?: boolean }) {
  return <span className="code-chips">{code.map((colorId, index) => <ColorChip colorId={colorId} key={`${colorId}-${index}`} small={small} />)}</span>;
}

export function ResultIcons({ value, compact = false }: { value: Score; compact?: boolean }) {
  const noResult = value.exact === 0 && value.misplaced === 0;
  return (
    <span className={compact ? 'practice-result-icons compact' : 'practice-result-icons'} aria-label={`完全正确 ${value.exact} 个，颜色对位置错 ${value.misplaced} 个`}>
      {Array.from({ length: value.exact }, (_, index) => <b className="result-icon exact" key={`exact-${index}`}>◎</b>)}
      {Array.from({ length: value.misplaced }, (_, index) => <b className="result-icon misplaced" key={`misplaced-${index}`}>◉</b>)}
      {noResult && <i className="no-result-mark" aria-hidden="true">无</i>}
    </span>
  );
}
