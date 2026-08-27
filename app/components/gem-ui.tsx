import { useEffect, useRef, useState, type CSSProperties } from 'react'

import { COLORS, COLOR_BY_ID, type ColorId, type Score } from '../lib/tribute'
import { cn } from '../lib/cn'

export function GemInput({ value, onChange, label, centered = false }: { value: ColorId[]; onChange: (value: ColorId[]) => void; label: string; centered?: boolean }) {
  const [activePosition, setActivePosition] = useState<number | null>(null)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const closePicker = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setActivePosition(null)
    }
    document.addEventListener('pointerdown', closePicker)
    return () => document.removeEventListener('pointerdown', closePicker)
  }, [])

  const chooseColor = (colorId: ColorId) => {
    if (activePosition === null) return
    onChange(value.map((current, index) => (index === activePosition ? colorId : current)) as ColorId[])
    setActivePosition(activePosition === value.length - 1 ? null : activePosition + 1)
  }

  return (
    <div
      className={cn(
        'relative z-2 grid w-full justify-items-start gap-2.5 max-[560px]:justify-items-center',
        centered && 'justify-items-center *:data-gem-picker:left-1/2 *:data-gem-picker:-translate-x-1/2'
      )}
      aria-label={label}
      ref={rootRef}
    >
      <div className='gem-input-grid'>
        {value.map((colorId, position) => {
          const color = COLOR_BY_ID.get(colorId)!
          const active = activePosition === position
          return (
            <button
              type='button'
              className={cn(
                'gem-button',
                active &&
                  '[background:color-mix(in_srgb,var(--swatch)_24%,#fff4d7)] shadow-[0_4px_10px_color-mix(in_srgb,var(--swatch)_50%,transparent)] -translate-y-0.5 scale-105'
              )}
              style={{ '--swatch': color.swatch } as CSSProperties}
              aria-expanded={active}
              aria-label={`位置 ${position + 1}，当前${color.name}色`}
              key={position}
              onClick={() => setActivePosition(position)}
            >
              <span aria-hidden='true' className='gem-image' style={{ '--gem-image': `url(${color.image})` } as CSSProperties} />
            </button>
          )
        })}
      </div>

      {activePosition !== null && (
        <div data-gem-picker className='gem-picker' role='group' aria-label={`为位置 ${activePosition + 1} 选择颜色`}>
          {COLORS.map((color) => (
            <button
              type='button'
              className='gem-picker-option'
              aria-pressed={value[activePosition] === color.id}
              aria-label={color.name}
              key={color.id}
              onClick={() => chooseColor(color.id)}
            >
              <span aria-hidden='true' className='gem-image' style={{ '--gem-image': `url(${color.image})` } as CSSProperties} />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export function ColorChip({ colorId, small = false }: { colorId: ColorId; small?: boolean }) {
  const color = COLOR_BY_ID.get(colorId)!
  return (
    <span data-color-chip className={cn('color-chip', small && 'color-chip--small')} role='img' aria-label={color.name}>
      <span aria-hidden='true' className={cn('gem-image', small && 'gem-image--small')} style={{ '--gem-image': `url(${color.image})` } as CSSProperties} />
    </span>
  )
}

export function CodeChips({ code, small = false }: { code: ColorId[]; small?: boolean }) {
  return (
    <span data-code-chips className='code-chips'>
      {code.map((colorId, index) => (
        <ColorChip colorId={colorId} key={`${colorId}-${index}`} small={small} />
      ))}
    </span>
  )
}

export function ResultIcons({ value }: { value: Score; compact?: boolean }) {
  const noResult = value.exact === 0 && value.misplaced === 0
  return (
    <span data-result-icons className='result-icons' aria-label={`完全正确 ${value.exact} 个，颜色对位置错 ${value.misplaced} 个`}>
      {Array.from({ length: value.exact }, (_, index) => (
        <b data-result-icon className='result-icon bg-top-left' key={`exact-${index}`}></b>
      ))}
      {Array.from({ length: value.misplaced }, (_, index) => (
        <b data-result-icon className='result-icon bg-top-right' key={`misplaced-${index}`}></b>
      ))}
      {noResult && (
        <i className='text-xs font-extrabold not-italic text-[#7e6b54]' aria-hidden='true'>
          无
        </i>
      )}
    </span>
  )
}
