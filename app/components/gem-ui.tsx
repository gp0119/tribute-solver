import { useEffect, useRef, useState, type CSSProperties } from 'react'

import { COLORS, COLOR_BY_ID, type ColorId, type Score } from '../lib/tribute'
import { cn } from '../lib/cn'

const gemButtonClass =
  'grid size-18 place-items-center rounded-lg border-0 bg-[linear-gradient(145deg,#fff8e5,#e4c58f)] p-0 shadow-[0_1px_3px_rgb(69_42_17/0.18)] transition-[transform,filter,box-shadow] duration-150 hover:-translate-y-px hover:brightness-[1.04] focus-visible:outline-3 focus-visible:outline-[#2f8ba0] focus-visible:outline-offset-3 max-[800px]:size-16 max-[560px]:size-14'

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
      <div className='grid grid-cols-[repeat(4,--spacing(18))] gap-3 max-[800px]:grid-cols-[repeat(4,--spacing(16))] max-[800px]:gap-2 max-[560px]:grid-cols-[repeat(4,--spacing(14))] max-[560px]:gap-1.5'>
        {value.map((colorId, position) => {
          const color = COLOR_BY_ID.get(colorId)!
          const active = activePosition === position
          return (
            <button
              type='button'
              className={cn(
                gemButtonClass,
                active &&
                  '[background:color-mix(in_srgb,var(--swatch)_24%,#fff4d7)] shadow-[0_4px_10px_color-mix(in_srgb,var(--swatch)_50%,transparent)] -translate-y-0.5 scale-105'
              )}
              style={{ '--swatch': color.swatch } as CSSProperties}
              aria-expanded={active}
              aria-label={`位置 ${position + 1}，当前${color.name}色`}
              key={position}
              onClick={() => setActivePosition(position)}
            >
              <span
                aria-hidden='true'
                className='block size-16 bg-(image:--gem-image) drop-shadow-[0_2px_1px_rgb(47_29_15/0.35)] max-[800px]:scale-90 max-[560px]:scale-75'
                style={{ '--gem-image': `url(${color.image})` } as CSSProperties}
              />
            </button>
          )
        })}
      </div>

      {activePosition !== null && (
        <div
          data-gem-picker
          className='absolute top-[calc(100%+--spacing(2))] left-0 z-10 grid grid-cols-[repeat(6,--spacing(18))] gap-1 rounded-xl bg-[linear-gradient(145deg,#f4e3c1,#ddbd84)] p-2 shadow-[0_10px_24px_rgb(69_42_17/0.24)] max-[800px]:grid-cols-[repeat(6,--spacing(16))] max-[560px]:left-1/2 max-[560px]:grid-cols-[repeat(3,--spacing(14))] max-[560px]:gap-1 max-[560px]:-translate-x-1/2'
          role='group'
          aria-label={`为位置 ${activePosition + 1} 选择颜色`}
        >
          {COLORS.map((color) => (
            <button
              type='button'
              className='relative grid size-18 place-items-center rounded-lg border-0 bg-[linear-gradient(145deg,#fff8e5,#e4c58f)] p-0 text-xs font-extrabold text-[#fff8df] shadow-[0_1px_2px_rgb(69_42_17/0.14)] transition-[transform,filter] duration-150 hover:-translate-y-0.5 hover:brightness-[1.08] focus-visible:outline-3 focus-visible:outline-[#2f8ba0] focus-visible:outline-offset-3 max-[800px]:size-16 max-[560px]:size-14'
              aria-pressed={value[activePosition] === color.id}
              aria-label={color.name}
              key={color.id}
              onClick={() => chooseColor(color.id)}
            >
              <span
                aria-hidden='true'
                className='block size-16 bg-(image:--gem-image) drop-shadow-[0_2px_1px_rgb(47_29_15/0.35)] max-[800px]:scale-90 max-[560px]:scale-75'
                style={{ '--gem-image': `url(${color.image})` } as CSSProperties}
              />
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
    <span data-color-chip className={cn('relative inline-grid size-18 place-items-center', small && 'size-14')} role='img' aria-label={color.name}>
      <span
        aria-hidden='true'
        className={cn('block size-16 bg-(image:--gem-image) drop-shadow-[0_2px_1px_rgb(47_29_15/0.35)]', small && 'size-full bg-center bg-no-repeat bg-size-[88%_auto]')}
        style={{ '--gem-image': `url(${color.image})` } as CSSProperties}
      />
    </span>
  )
}

export function CodeChips({ code, small = false }: { code: ColorId[]; small?: boolean }) {
  return (
    <span data-code-chips className='relative z-1 inline-flex flex-wrap gap-2 align-middle'>
      {code.map((colorId, index) => (
        <ColorChip colorId={colorId} key={`${colorId}-${index}`} small={small} />
      ))}
    </span>
  )
}

export function ResultIcons({ value }: { value: Score; compact?: boolean }) {
  const noResult = value.exact === 0 && value.misplaced === 0
  const iconClass = "inline-block size-5 shrink-0 rounded-full border-0 bg-[url('/dst-result-icons.png')] bg-size-[200%_100%] bg-no-repeat text-[0px] leading-none"

  return (
    <span
      data-result-icons
      className='inline-flex min-w-28 items-center justify-start gap-1 rounded-lg bg-[linear-gradient(90deg,rgb(209_241_234/0.66),rgb(250_237_178/0.64))] px-2 py-1.5'
      aria-label={`完全正确 ${value.exact} 个，颜色对位置错 ${value.misplaced} 个`}
    >
      {Array.from({ length: value.exact }, (_, index) => (
        <b data-result-icon className={cn(iconClass, 'bg-top-left')} key={`exact-${index}`}></b>
      ))}
      {Array.from({ length: value.misplaced }, (_, index) => (
        <b data-result-icon className={cn(iconClass, 'bg-top-right')} key={`misplaced-${index}`}></b>
      ))}
      {noResult && (
        <i className='text-xs font-extrabold not-italic text-[#7e6b54]' aria-hidden='true'>
          无
        </i>
      )}
    </span>
  )
}
