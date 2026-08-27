'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useMemo, useState, useSyncExternalStore } from 'react'

import { CodeChips, GemInput, ResultIcons } from './components/gem-ui'
import { getAttemptsSnapshot, getServerAttemptsSnapshot, MAX_RECORDED_ATTEMPTS, parseAttemptsSnapshot, saveAttempts, subscribeToAttempts } from './lib/attempt-storage'
import { cn } from './lib/cn'
import { codeKey, findBestRecommendation, findMatchingCodes, type ColorId, type Score } from './lib/tribute'

const panelClass = 'relative rounded-2xl border border-[#c9a96d] bg-[rgb(255_247_226/0.84)] p-6 max-[560px]:rounded-xl max-[560px]:px-3 max-[560px]:py-4'
const sectionClass = 'rounded-2xl border border-[#c9a96d] bg-[rgb(255_247_226/0.84)] px-6 py-5.5 max-[560px]:rounded-xl max-[560px]:px-3 max-[560px]:py-4'
const headingClass = 'mt-1.5 mb-0 text-2xl font-black tracking-[0.035em] text-[#4b311e] max-[560px]:text-xl'
const primaryButtonClass =
  'w-full cursor-pointer rounded-lg border border-[#702c21] bg-[linear-gradient(#c45b42,#903528)] px-3.5 py-3 font-extrabold tracking-[0.04em] text-[#fff7dc] shadow-[inset_0_1px_rgb(255_255_255/0.32),inset_0_-2px_rgb(73_24_19/0.33),0_3px_0_rgb(87_40_19/0.16)] transition-[filter,transform] duration-150 hover:not-disabled:-translate-y-px hover:not-disabled:brightness-[1.06] disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-3 focus-visible:outline-[#2f8ba0] focus-visible:outline-offset-3'
const secondaryButtonClass =
  'relative z-1 cursor-pointer rounded-lg border border-[#8eaa77] bg-[linear-gradient(#fffef7,#edf2df)] px-3.5 py-2.5 text-sm font-extrabold text-[#46633b] shadow-[inset_0_1px_rgb(255_255_255/0.75),0_2px_0_rgb(104_72_32/0.12)] transition-[transform,filter,box-shadow] duration-150 hover:-translate-y-px hover:brightness-[1.04] hover:shadow-[inset_0_1px_rgb(255_255_255/0.8),0_4px_0_rgb(104_72_32/0.13)] focus-visible:outline-3 focus-visible:outline-[#2f8ba0] focus-visible:outline-offset-3'
const resultIconClass = "inline-block size-5 shrink-0 rounded-full border-0 bg-[url('/dst-result-icons.png')] bg-size-[200%_100%] bg-no-repeat text-[0px] leading-none"

function CountOptions({
  label,
  value,
  onChange,
  tone,
  maximum,
}: {
  label: string
  value: number
  onChange: (value: number) => void
  tone: 'exact' | 'misplaced'
  maximum: number
}) {
  const selectedClass =
    tone === 'exact'
      ? 'border-transparent bg-[linear-gradient(#32a5a8,#176c79)] text-[#f5fffa] shadow-[inset_0_1px_rgb(255_255_255/0.35),0_1px_2px_rgb(15_72_78/0.26)]'
      : 'border-transparent bg-[linear-gradient(#c3a13b,#806817)] text-[#fffbe3] shadow-[inset_0_1px_rgb(255_255_255/0.35),0_1px_2px_rgb(93_72_14/0.25)]'

  return (
    <div className='grid grid-cols-[repeat(5,--spacing(9))] gap-1' role='group' aria-label={label}>
      {[0, 1, 2, 3, 4].map((count) => (
        <button
          type='button'
          key={count}
          className={cn(
            'min-h-7 cursor-pointer rounded-md border border-[rgb(120_87_43/0.28)] bg-[rgb(255_252_243/0.82)] p-0 text-sm font-black leading-none text-[#704d26] transition-[transform,filter,background] duration-150 hover:not-disabled:-translate-y-px hover:not-disabled:brightness-[0.97] disabled:cursor-not-allowed disabled:bg-[rgb(224_214_194/0.45)] disabled:text-[#b7aa96] disabled:opacity-60 focus-visible:outline-3 focus-visible:outline-[#2f8ba0] focus-visible:outline-offset-3',
            count === value && selectedClass
          )}
          aria-pressed={count === value}
          disabled={count > maximum}
          onClick={() => onChange(count)}
        >
          {count}
        </button>
      ))}
    </div>
  )
}

export default function Home() {
  const [draftGuess, setDraftGuess] = useState<ColorId[]>([0, 0, 1, 1])
  const [draftScore, setDraftScore] = useState<Score>({ exact: 0, misplaced: 0 })
  const [showConflict, setShowConflict] = useState(false)
  const attemptsSnapshot = useSyncExternalStore(subscribeToAttempts, getAttemptsSnapshot, getServerAttemptsSnapshot)
  const attempts = useMemo(() => parseAttemptsSnapshot(attemptsSnapshot), [attemptsSnapshot])
  const candidates = useMemo(() => findMatchingCodes(attempts), [attempts])
  const recommendation = useMemo(() => findBestRecommendation(candidates), [candidates])

  const setScore = (kind: keyof Score, value: number) => {
    setDraftScore((current) => {
      const other = kind === 'exact' ? current.misplaced : current.exact
      return value + other > 4 ? current : { ...current, [kind]: value }
    })
  }

  const addAttempt = () => {
    if (attempts.length >= MAX_RECORDED_ATTEMPTS || draftScore.exact + draftScore.misplaced > 4) return
    const nextAttempt = { id: Date.now(), guess: [...draftGuess], exact: draftScore.exact, misplaced: draftScore.misplaced }
    if (findMatchingCodes([...attempts, nextAttempt]).length === 0) {
      setShowConflict(true)
      return
    }
    saveAttempts([...attempts, nextAttempt])
    setDraftScore({ exact: 0, misplaced: 0 })
  }

  const reset = () => {
    saveAttempts([])
    setDraftGuess([0, 0, 1, 1])
    setDraftScore({ exact: 0, misplaced: 0 })
    setShowConflict(false)
  }

  const isSolved = candidates.length === 1
  const tooManyRows = attempts.length >= MAX_RECORDED_ATTEMPTS
  const candidateCountClass =
    candidates.length === 0
      ? 'grid h-11 min-w-16 place-items-center rounded-lg border border-[#c67767] bg-[linear-gradient(135deg,#f7dbcc,#e8ae9e)] text-2xl font-extrabold text-[#882f29] shadow-[inset_0_0_0_2px_rgb(255_248_225/0.53)]'
      : 'grid h-11 min-w-16 place-items-center rounded-lg border border-[#7aa26d] bg-[linear-gradient(135deg,#e7f1c9,#afd198)] text-2xl font-extrabold text-[#2e6135] shadow-[inset_0_0_0_2px_rgb(255_248_225/0.53)]'

  return (
    <main className='relative isolate mx-auto w-[min(72rem,calc(100%---spacing(8)))] py-11 pb-16 max-[800px]:py-6.5 max-[800px]:pb-10 max-[800px]:before:hidden max-[800px]:after:hidden max-[560px]:w-[calc(100%---spacing(4))] max-[560px]:py-4 max-[560px]:pb-7'>
      <header className='relative mb-6 flex items-start justify-between gap-6 px-1.5 pb-6.5 max-[800px]:flex-col max-[800px]:gap-3.5 max-[560px]:mb-3.5 max-[560px]:gap-2.5 max-[560px]:px-0.5 max-[560px]:pb-4.5'>
        <div className='relative pl-6.5 max-[560px]:pl-0 max-[560px]:text-center'>
          <p className='m-0 text-xs font-extrabold tracking-[0.12em] text-[#95692f]'>DON&apos;T STARVE TOGETHER · MEDAL MOD</p>
          <h1 className='mt-1.5 mb-2 text-[clamp(2.15rem,5vw,3.35rem)] font-black tracking-[0.075em] text-[#3f2919] [text-shadow:0_2px_0_#ffeac0,0_3px_5px_rgb(81_47_21/0.12)] max-[800px]:text-4xl max-[560px]:mt-1.5 max-[560px]:mb-1.5 max-[560px]:text-3xl max-[560px]:tracking-[0.045em] max-[560px]:text-center'>
            奉纳符推演器
          </h1>
          <p className='m-0 text-base text-[#705c47] max-[560px]:mx-auto max-[560px]:max-w-124 max-[560px]:text-center max-[560px]:text-sm max-[560px]:leading-6'>
            输入每行的颜色与图标数量，自动推断答案和下一手。
          </p>
        </div>
        <div className='flex items-center gap-3 pt-2 max-[800px]:w-full max-[800px]:justify-between max-[800px]:pt-0 max-[560px]:grid max-[560px]:grid-cols-[1fr_auto] max-[560px]:gap-2'>
          <nav
            className='inline-flex items-center gap-1 rounded-lg border border-[rgb(165_119_55/0.42)] bg-[rgb(255_249_232/0.58)] p-1 shadow-[inset_0_1px_rgb(255_255_255/0.62)] max-[560px]:col-span-full max-[560px]:grid max-[560px]:grid-cols-2'
            aria-label='页面导航'
          >
            <Link
              className='rounded-md bg-[linear-gradient(#a96c2a,#754317)] px-2.5 py-1.5 text-xs leading-none font-black text-[#fff6db] shadow-[inset_0_1px_rgb(255_255_255/0.3)] max-[560px]:px-2.5 max-[560px]:py-2 max-[560px]:text-center'
              href='/'
            >
              推演器
            </Link>
            <Link
              className='rounded-md px-2.5 py-1.5 text-xs leading-none font-black text-[#73532a] transition-[background,color,transform] duration-150 hover:bg-[rgb(236_215_173/0.72)] hover:text-[#4f351b] max-[560px]:px-2.5 max-[560px]:py-2 max-[560px]:text-center'
              href='/practice'
            >
              做题
            </Link>
          </nav>
          <button
            type='button'
            className='cursor-pointer rounded-lg border border-[#ad7d3b] bg-[linear-gradient(#fff9e8,#f1deba)] px-4 py-2.5 font-extrabold text-[#684820] shadow-[inset_0_1px_rgb(255_255_255/0.75),0_2px_0_rgb(104_72_32/0.12)] transition-[transform,filter,box-shadow] duration-150 hover:-translate-y-px hover:brightness-[1.04] hover:shadow-[inset_0_1px_rgb(255_255_255/0.8),0_4px_0_rgb(104_72_32/0.13)] focus-visible:outline-3 focus-visible:outline-[#2f8ba0] focus-visible:outline-offset-3 max-[560px]:justify-self-end'
            onClick={reset}
          >
            新一题
          </button>
        </div>
      </header>

      <div
        className="pointer-events-none -mt-4.5 mb-4 flex h-12 items-center justify-center gap-8 opacity-85 before:h-px before:w-[min(18vw,--spacing(36))] before:bg-[linear-gradient(90deg,transparent,rgb(151_103_43/0.56))] before:content-[''] after:h-px after:w-[min(18vw,--spacing(36))] after:scale-x-[-1] after:bg-[linear-gradient(90deg,transparent,rgb(151_103_43/0.56))] after:content-[''] max-[800px]:mb-3 max-[560px]:-mt-3 max-[560px]:mb-2.5 max-[560px]:h-11 max-[560px]:gap-4.5 max-[560px]:before:w-[min(12vw,--spacing(14))] max-[560px]:after:w-[min(12vw,--spacing(14))]"
        aria-hidden='true'
      >
        <Image className='size-11 object-contain drop-shadow-[0_2px_1px_rgb(67_40_20/0.38)] max-[560px]:size-10' src='/tribute-symbol.png' alt='' width={64} height={64} />
        <Image className='size-14 object-contain drop-shadow-[0_2px_1px_rgb(67_40_20/0.38)] max-[560px]:size-12' src='/tribute-box.png' alt='' width={64} height={64} />
        <Image className='size-11 object-contain drop-shadow-[0_2px_1px_rgb(67_40_20/0.38)] max-[560px]:size-10' src='/saltfish-statue.png' alt='' width={64} height={64} />
      </div>

      <section className={cn(sectionClass, 'mb-5 max-[560px]:mb-3')} aria-labelledby='history-title'>
        <div className='mb-4 flex items-end justify-between gap-4.5 max-[560px]:mb-2.5 max-[560px]:flex-col max-[560px]:items-center max-[560px]:gap-2.5 max-[560px]:text-center'>
          <h2 className={headingClass} id='history-title'>
            推理记录
          </h2>
        </div>
        {attempts.length === 0 ? (
          <div className='m-0 rounded-xl border border-dashed border-[#d0af75] bg-[rgb(255_250_238/0.54)] p-3.5 leading-relaxed text-[#795f41] max-[560px]:p-3 max-[560px]:leading-normal max-[560px]:text-center'>
            还没有记录。可以先照默认的“红 红 蓝 蓝”提交第一行。
          </div>
        ) : (
          <ol className='m-0 grid list-none gap-2 p-0'>
            {attempts.map((attempt, index) => (
              <li
                className='grid grid-cols-[--spacing(8)_minmax(0,1fr)_auto] items-center gap-2.5 rounded-xl border border-[#dfccaa] bg-[linear-gradient(100deg,rgb(255_253_245/0.84),rgb(247_235_209/0.56))] px-2.5 py-2 transition-[background,border-color,transform] duration-150 hover:-translate-y-px hover:border-[#cda462] hover:bg-[#fffdf6] max-[560px]:grid-cols-[auto_minmax(0,1fr)_auto] max-[560px]:gap-1.5 max-[560px]:px-1.5 max-[560px]:py-2 max-[560px]:*:data-code-chips:justify-self-start max-[560px]:*:data-code-chips:flex-nowrap max-[560px]:*:data-code-chips:gap-px max-[560px]:**:data-color-chip:size-[clamp(--spacing(9),11vw,--spacing(11))]'
                key={attempt.id}
              >
                <span className='grid size-7 place-items-center rounded-full border border-[#af7d3e] bg-[radial-gradient(circle_at_35%_30%,#fff2ca,#e5c487)] text-sm font-black text-[#785127]'>
                  {index + 1}
                </span>
                <CodeChips code={attempt.guess} small />
                <span className='flex items-center gap-2.5 max-[560px]:justify-self-end max-[560px]:gap-1.5 max-[560px]:**:data-result-icons:min-w-0 max-[560px]:**:data-result-icons:gap-0.5 max-[560px]:**:data-result-icons:px-1.5 max-[560px]:**:data-result-icons:py-1.5 max-[560px]:**:data-result-icon:size-4'>
                  <ResultIcons value={{ exact: attempt.exact, misplaced: attempt.misplaced }} compact />
                  <button
                    type='button'
                    className='cursor-pointer rounded-md border border-[#d3a69c] bg-[linear-gradient(#fffaf7,#f8e6dd)] px-2.5 py-1.5 text-xs font-extrabold text-[#885044] transition-[transform,filter,box-shadow] duration-150 hover:-translate-y-px hover:brightness-[1.04] focus-visible:outline-3 focus-visible:outline-[#2f8ba0] focus-visible:outline-offset-3 max-[560px]:min-w-10 max-[560px]:rounded-full max-[560px]:px-1.5 max-[560px]:py-1 max-[560px]:text-xs max-[560px]:leading-none'
                    onClick={() => saveAttempts(attempts.filter((item) => item.id !== attempt.id))}
                    aria-label={`删除第${index + 1}行`}
                  >
                    删除
                  </button>
                </span>
              </li>
            ))}
          </ol>
        )}
      </section>

      <div className='grid grid-cols-1 gap-5 max-[560px]:gap-3'>
        <section className={cn(panelClass, 'overflow-visible')} aria-labelledby='entry-title'>
          <div className='flex items-start justify-between gap-4.5 max-[560px]:items-center max-[560px]:gap-2.5'>
            <h2 className={headingClass} id='entry-title'>
              第 {Math.min(attempts.length + 1, MAX_RECORDED_ATTEMPTS)} 行
            </h2>
            <span className='grid h-11 min-w-12 place-items-center rounded-lg border border-[#ba8a47] bg-[linear-gradient(135deg,#fae9bd,#e2bd77)] text-xl font-extrabold text-[#70471b] shadow-[inset_0_0_0_2px_rgb(255_248_225/0.53)]'>
              {attempts.length}/{MAX_RECORDED_ATTEMPTS}
            </span>
          </div>

          <div className='my-2 mb-5 grid max-w-full grid-cols-[minmax(--spacing(80),max-content)_minmax(--spacing(64),1fr)] items-center gap-5 overflow-visible pb-1 max-[800px]:grid-cols-1 max-[800px]:gap-4 max-[560px]:my-1 max-[560px]:mb-3 max-[560px]:gap-2.5 max-[560px]:pb-0'>
            <GemInput value={draftGuess} onChange={setDraftGuess} label='选择四个颜色' />
            <div className='grid min-w-0 grid-rows-[auto_1fr_1fr] gap-1.5 rounded-lg border border-dashed border-[#c7aa76] bg-[rgb(255_252_242/0.58)] px-3 py-2.5'>
              <p className='mb-0.5 text-xs font-black tracking-[0.04em] text-[#785a34] max-[560px]:text-center'>选择结果</p>
              <div className='grid grid-cols-[minmax(--spacing(11),1fr)_auto] items-center gap-2'>
                <div className='flex min-h-7 items-center rounded-md bg-[rgb(211_242_235/0.7)] px-2 py-1 text-xs font-black text-[#315e60] max-[560px]:justify-center'>
                  <span className='inline-flex min-w-0 items-center gap-1 **:data-result-icon:size-6' aria-hidden='true'>
                    {Array.from({ length: draftScore.exact }, (_, index) => (
                      <b data-result-icon className={cn(resultIconClass, 'bg-top-left')} key={index}>
                        ◎
                      </b>
                    ))}
                  </span>
                </div>
                <CountOptions label='完全正确' value={draftScore.exact} onChange={(value) => setScore('exact', value)} tone='exact' maximum={4 - draftScore.misplaced} />
              </div>
              <div className='grid grid-cols-[minmax(--spacing(11),1fr)_auto] items-center gap-2'>
                <div className='flex min-h-7 items-center rounded-md bg-[rgb(249_237_176/0.66)] px-2 py-1 text-xs font-black text-[#6c591c] max-[560px]:justify-center'>
                  <span className='inline-flex min-w-0 items-center gap-1 **:data-result-icon:size-6' aria-hidden='true'>
                    {Array.from({ length: draftScore.misplaced }, (_, index) => (
                      <b data-result-icon className={cn(resultIconClass, 'bg-top-right')} key={index}>
                        ◉
                      </b>
                    ))}
                  </span>
                </div>
                <CountOptions
                  label='颜色对位置错'
                  value={draftScore.misplaced}
                  onChange={(value) => setScore('misplaced', value)}
                  tone='misplaced'
                  maximum={4 - draftScore.exact}
                />
              </div>
            </div>
            <div className='col-span-full grid w-full grid-cols-[minmax(0,1fr)] gap-2.5 self-start pb-0.5'>
              <button type='button' className={primaryButtonClass} onClick={addAttempt} disabled={tooManyRows}>
                记录这一行
              </button>
              {tooManyRows && <p className='m-0 text-sm text-[#875a34]'>已记录六行；可删掉某行后重新推断。</p>}
              {candidates.length > 1 && recommendation && (
                <div className='relative overflow-hidden rounded-xl border border-[#9cad72] bg-[linear-gradient(135deg,#fbf7db,#e0eec9)] p-3.5 max-[560px]:text-center'>
                  <p className='relative z-1 mb-2 text-xs font-black tracking-[0.08em] text-[#4f743f]'>推荐下一手</p>
                  <CodeChips code={recommendation.code} small />
                  <p className='relative z-1 my-2 text-xs text-[#547052]'>下一条结果至多留下 {recommendation.worstCase} 种可能。</p>
                  <button type='button' className={cn(secondaryButtonClass, 'px-2.5 py-2 text-xs')} onClick={() => setDraftGuess([...recommendation.code])}>
                    用作当前颜色
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>

        <section className={cn(panelClass, 'flex min-h-0 flex-col overflow-hidden')} aria-labelledby='analysis-title'>
          <div className='flex items-start justify-between gap-4.5 max-[560px]:items-center max-[560px]:gap-2.5'>
            <h2 className={headingClass} id='analysis-title'>
              {candidates.length === 0 ? '记录有矛盾' : isSolved ? '答案已确定' : '剩余候选'}
            </h2>
            <strong className={candidateCountClass}>{candidates.length}</strong>
          </div>

          {candidates.length === 0 ? (
            <div className='mt-auto rounded-xl border border-dashed border-[#d39b91] bg-[#fff1e9] p-3.5 leading-relaxed text-[#863e34] max-[560px]:p-3 max-[560px]:text-center'>
              <p className='m-0'>没有任何排列符合这些结果。请检查某一行的两种图标数量，或删除该行后重填。</p>
            </div>
          ) : isSolved ? (
            <div className='relative mt-6 overflow-hidden rounded-xl border border-[#6e9c72] bg-[linear-gradient(135deg,#e9f6dc,#c8e8be)] p-4.5 '>
              <CodeChips code={candidates[0]} />
            </div>
          ) : null}

          {candidates.length > 1 && candidates.length <= 24 && (
            <div
              className='mt-5.5 rounded-xl border border-[#dcc69a] bg-[linear-gradient(145deg,rgb(255_253_245/0.78),rgb(246_232_201/0.52))] p-3 max-[560px]:mt-3 max-[560px]:p-2.5'
              aria-label='全部剩余候选'
            >
              <div className='mb-2.5 flex items-center justify-between gap-2.5'>
                <p className='m-0 text-sm font-black tracking-[0.06em] text-[#73542d]'>候选清单</p>
                <span className='rounded-full bg-[#dcebc8] px-2 py-1 text-xs font-black text-[#587047]'>{candidates.length} 组</span>
              </div>
              <div className='grid grid-cols-[repeat(auto-fit,minmax(--spacing(56),1fr))] gap-2'>
                {candidates.map((code) => (
                  <div
                    className='*:data-code-chips:flex *:data-code-chips:w-full *:data-code-chips:justify-center *:data-code-chips:rounded-lg *:data-code-chips:border *:data-code-chips:border-[rgb(177_144_87/0.28)] *:data-code-chips:bg-[rgb(255_255_255/0.62)] *:data-code-chips:p-1 hover:*:data-code-chips:border-[#c49d5b] hover:*:data-code-chips:bg-[#fffdf6]'
                    key={codeKey(code)}
                  >
                    <CodeChips code={code} small />
                  </div>
                ))}
              </div>
            </div>
          )}
          {candidates.length > 24 && (
            <p className='mt-auto rounded-xl border border-dashed border-[#d0af75] bg-[rgb(255_250_238/0.54)] p-3.5 leading-relaxed text-[#795f41] max-[560px]:p-3 max-[560px]:text-center'>
              候选较多时先使用推荐下一手，结果会大幅缩小范围。
            </p>
          )}
        </section>
      </div>

      {showConflict && (
        <div className='fixed inset-0 z-100 grid place-items-center bg-[rgb(43_27_17/0.58)] p-4.5 backdrop-blur-xs' role='presentation' onClick={() => setShowConflict(false)}>
          <section
            className='w-[min(26rem,100%)] rounded-2xl border border-[#c98e55] bg-[linear-gradient(145deg,#fff8e8,#f1d7ad)] p-6 text-center text-[#593721]'
            role='alertdialog'
            aria-modal='true'
            aria-labelledby='conflict-title'
            onClick={(event) => event.stopPropagation()}
          >
            <span
              className='mx-auto mb-3 grid size-10 place-items-center rounded-full border border-[#8b392b] bg-[linear-gradient(#c75e43,#8d3127)] text-2xl font-black text-[#fff4d9]'
              aria-hidden='true'
            >
              !
            </span>
            <p className='m-0 text-xs font-extrabold tracking-[0.12em] text-[#95692f]'>无法记录</p>
            <h2 className={cn(headingClass, 'mb-2.5')} id='conflict-title'>
              记录有矛盾
            </h2>
            <p className='m-0 leading-relaxed text-[#76543a]'>当前颜色和图标数量与已有记录无法同时成立，请检查后再提交。</p>
            <button type='button' className={cn(primaryButtonClass, 'mt-4.5')} autoFocus onClick={() => setShowConflict(false)}>
              返回修改
            </button>
          </section>
        </div>
      )}
    </main>
  )
}
