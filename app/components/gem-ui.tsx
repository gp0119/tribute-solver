import { useEffect, useRef, useState, type CSSProperties } from 'react';

import { COLORS, COLOR_BY_ID, type ColorId, type Score } from '../lib/tribute';

export function GemInput({ value, onChange, label }: { value: ColorId[]; onChange: (value: ColorId[]) => void; label: string }) {
  const [activePosition, setActivePosition] = useState<number | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const closePicker = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setActivePosition(null);
    };
    document.addEventListener('pointerdown', closePicker);
    return () => document.removeEventListener('pointerdown', closePicker);
  }, []);

  const chooseColor = (colorId: ColorId) => {
    if (activePosition === null) return;
    onChange(value.map((current, index) => (index === activePosition ? colorId : current)) as ColorId[]);
    setActivePosition(activePosition === value.length - 1 ? null : activePosition + 1);
  };

  return (
    <div className="gem-input" aria-label={label} ref={rootRef}>
      <div className="gem-input-slots">
        {value.map((colorId, position) => {
          const color = COLOR_BY_ID.get(colorId)!;
          const active = activePosition === position;
          return (
            <button
              type="button"
              className={active ? 'gem-input-slot active' : 'gem-input-slot'}
              style={{ '--swatch': color.swatch, '--gem-image': `url(${color.image})` } as CSSProperties}
              aria-expanded={active}
              aria-label={`位置 ${position + 1}，当前${color.name}色`}
              key={position}
              onClick={() => setActivePosition(position)}
            >
              <span aria-hidden="true" />
            </button>
          );
        })}
      </div>

      {activePosition !== null && (
        <div className="gem-picker" role="group" aria-label={`为位置 ${activePosition + 1} 选择颜色`}>
          {COLORS.map((color) => (
            <button
              type="button"
              className="color-option"
              style={{ '--gem-image': `url(${color.image})` } as CSSProperties}
              aria-pressed={value[activePosition] === color.id}
              aria-label={color.name}
              key={color.id}
              onClick={() => chooseColor(color.id)}
            >
              <span aria-hidden="true" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

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
