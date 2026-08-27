'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'

import { CodeChips, GemInput, ResultIcons } from '../components/gem-ui'
import { cn } from '../lib/cn'
import { randomCode, score, type ColorId, type Score } from '../lib/tribute'

type PracticeAttempt = { id: number; guess: ColorId[]; result: Score }

const DEFAULT_GUESS: ColorId[] = [0, 0, 1, 1]
const headingClass = 'mt-1.5 mb-0 text-2xl font-black tracking-[0.035em] text-[#4b311e] max-[560px]:text-xl'
const panelClass = 'relative rounded-2xl border border-[#c9a96d] bg-[rgb(255_247_226/0.84)] p-6 max-[560px]:rounded-xl max-[560px]:px-3 max-[560px]:py-4'
const sectionClass = 'rounded-2xl border border-[#c9a96d] bg-[rgb(255_247_226/0.84)] px-6 py-5.5 max-[560px]:rounded-xl max-[560px]:px-3 max-[560px]:py-4'
const primaryButtonClass =
  'w-full cursor-pointer rounded-lg border border-[#702c21] bg-[linear-gradient(#c45b42,#903528)] px-3.5 py-3 font-extrabold tracking-[0.04em] text-[#fff7dc] transition-[filter,transform] duration-150 hover:not-disabled:-translate-y-px hover:not-disabled:brightness-[1.06] disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-3 focus-visible:outline-[#2f8ba0] focus-visible:outline-offset-3'
const secondaryButtonClass =
  'relative z-1 cursor-pointer rounded-lg border border-[#8eaa77] bg-[linear-gradient(#fffef7,#edf2df)] px-3.5 py-2.5 text-sm font-extrabold text-[#46633b] transition-[transform,filter,box-shadow] duration-150 hover:-translate-y-px hover:brightness-[1.04] focus-visible:outline-3 focus-visible:outline-[#2f8ba0] focus-visible:outline-offset-3'

export default function PracticePage() {
  const [answer, setAnswer] = useState<ColorId[]>(() => randomCode())
  const [guess, setGuess] = useState<ColorId[]>(DEFAULT_GUESS)
  const [attempts, setAttempts] = useState<PracticeAttempt[]>([])
  const [answerVisible, setAnswerVisible] = useState(false)

  const lastAttempt = attempts.at(-1)
  const solved = lastAttempt?.result.exact === 4
  const finished = Boolean(solved || answerVisible)

  const submitGuess = () => {
    if (finished) return
    const result = score(guess, answer)
    setAttempts((current) => [...current, { id: Date.now(), guess: [...guess], result }])
  }

  const newQuestion = () => {
    setAnswer(randomCode())
    setGuess(DEFAULT_GUESS)
    setAttempts([])
    setAnswerVisible(false)
  }

  return (
    <main className='relative isolate mx-auto w-[min(72rem,calc(100%---spacing(8)))] py-11 pb-16 max-[800px]:w-[calc(100%---spacing(5))] max-[800px]:py-6.5 max-[800px]:pb-10 max-[800px]:before:hidden max-[800px]:after:hidden max-[560px]:w-[calc(100%---spacing(4))] max-[560px]:py-4 max-[560px]:pb-7'>
      <header className='relative mb-6 flex items-start justify-between gap-6 px-1.5 pb-6.5 max-[800px]:flex-col max-[800px]:gap-3.5 max-[560px]:mb-3.5 max-[560px]:gap-2.5 max-[560px]:px-0.5 max-[560px]:pb-4.5'>
        <div className='relative pl-6.5 max-[560px]:pl-0 max-[560px]:text-center'>
          <span className='absolute top-0.5 left-0 text-base text-[#9f7135] [text-shadow:0_1px_#fff1cf] max-[560px]:hidden' aria-hidden='true'>
            ✦
          </span>
          <p className='m-0 text-xs font-extrabold tracking-[0.12em] text-[#95692f]'>DON&apos;T STARVE TOGETHER · MEDAL MOD</p>
          <h1 className='mt-1.5 mb-2 text-[clamp(2.15rem,5vw,3.35rem)] font-black tracking-[0.075em] text-[#3f2919] [text-shadow:0_2px_0_#ffeac0,0_3px_5px_rgb(81_47_21/0.12)] max-[800px]:text-4xl max-[560px]:mt-1.5 max-[560px]:mb-1.5 max-[560px]:text-3xl max-[560px]:tracking-[0.045em] max-[560px]:text-center'>
            奉纳符做题
          </h1>
          <p className='m-0 text-base text-[#705c47] max-[560px]:mx-auto max-[560px]:max-w-124 max-[560px]:text-center max-[560px]:text-sm max-[560px]:leading-6'>
            网页随机出题，直接按游戏规则给出两种图标结果。
          </p>
        </div>
        <div className='flex items-center gap-3 pt-2 max-[800px]:w-full max-[800px]:justify-between max-[800px]:pt-0 max-[560px]:grid max-[560px]:grid-cols-1 max-[560px]:gap-2'>
          <nav
            className='inline-flex items-center gap-1 rounded-lg border border-[rgb(165_119_55/0.42)] bg-[rgb(255_249_232/0.58)] p-1 shadow-[inset_0_1px_rgb(255_255_255/0.62)] max-[560px]:grid max-[560px]:grid-cols-2'
            aria-label='页面导航'
          >
            <Link
              className='rounded-md px-2.5 py-1.5 text-xs leading-none font-black text-[#73532a] transition-[background,color,transform] duration-150 hover:bg-[rgb(236_215_173/0.72)] hover:text-[#4f351b] max-[560px]:px-2.5 max-[560px]:py-2 max-[560px]:text-center'
              href='/'
            >
              推演器
            </Link>
            <Link
              className='rounded-md bg-[linear-gradient(#a96c2a,#754317)] px-2.5 py-1.5 text-xs leading-none font-black text-[#fff6db] shadow-[inset_0_1px_rgb(255_255_255/0.3)] max-[560px]:px-2.5 max-[560px]:py-2 max-[560px]:text-center'
              href='/practice'
            >
              做题
            </Link>
          </nav>
          <button
            type='button'
            className='cursor-pointer rounded-lg border border-[#ad7d3b] bg-[linear-gradient(#fff9e8,#f1deba)] px-4 py-2.5 font-extrabold text-[#684820] shadow-[inset_0_1px_rgb(255_255_255/0.75),0_2px_0_rgb(104_72_32/0.12)] transition-[transform,filter,box-shadow] duration-150 hover:-translate-y-px hover:brightness-[1.04] hover:shadow-[inset_0_1px_rgb(255_255_255/0.8),0_4px_0_rgb(104_72_32/0.13)] focus-visible:outline-3 focus-visible:outline-[#2f8ba0] focus-visible:outline-offset-3 max-[560px]:w-full'
            onClick={newQuestion}
          >
            换一题
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

      <section
        className='mb-5 rounded-xl border border-[#cba665] bg-[linear-gradient(120deg,rgb(255_248_224/0.9),rgb(247_227_184/0.72))] px-5 py-4.5 shadow-[inset_0_1px_rgb(255_255_255/0.72),0_8px_20px_rgb(83_48_18/0.06)] max-[560px]:mb-3 max-[560px]:px-3 max-[560px]:py-3.5'
        aria-labelledby='rules-title'
      >
        <h2 className='mt-1.5 mb-3 text-xl font-black tracking-[0.035em] text-[#4b311e] max-[560px]:mb-2.5 max-[560px]:text-center' id='rules-title'>
          游戏规则
        </h2>
        <ul className='m-0 grid list-none gap-2 p-0 text-sm leading-normal font-bold text-[#604326] max-[560px]:gap-1.5'>
          <li className="flex items-center gap-2 before:text-sm before:text-[#b27829] before:content-['❯']">答案由 4 个备选颜色随机排列组成，可以重复。</li>
          <li className="flex items-center gap-2 before:text-sm before:text-[#b27829] before:content-['❯']">根据每次记录，推理颜色种类和排列顺序。</li>
          <li className="flex items-center gap-2 before:text-sm before:text-[#b27829] before:content-['❯']">两种图标只表示数量，没有位置映射关系。</li>
          <li className="flex items-center gap-2 **:data-result-icon:ml-0.5 **:data-result-icon:size-6 before:text-sm before:text-[#b27829] before:content-['❯']">
            <b data-result-icon className="inline-block rounded-full bg-[url('/dst-result-icons.png')] bg-top-left bg-size-[200%_100%] bg-no-repeat text-[0px]">
              ◎
            </b>{' '}
            表示“颜色和位置都正确”的数量。
          </li>
          <li className="flex items-center gap-2 **:data-result-icon:ml-0.5 **:data-result-icon:size-6 before:text-sm before:text-[#b27829] before:content-['❯']">
            <b data-result-icon className="inline-block rounded-full bg-[url('/dst-result-icons.png')] bg-top-right bg-size-[200%_100%] bg-no-repeat text-[0px]">
              ◉
            </b>{' '}
            表示“颜色正确但位置错误”的数量。
          </li>
        </ul>
      </section>

      <section className={cn(sectionClass, 'mt-5 max-[560px]:mt-3')} aria-labelledby='practice-history-title'>
        <div className='mb-4 flex items-end justify-between gap-4.5 max-[560px]:mb-2.5 max-[560px]:flex-col max-[560px]:items-center max-[560px]:gap-2.5 max-[560px]:text-center'>
          <h2 className={headingClass} id='practice-history-title'>
            猜测结果
          </h2>
          <p className='m-0 text-sm text-[#80694d]'>{attempts.length === 0 ? '提交后会立即显示游戏图标。' : `${attempts.length} 次`}</p>
        </div>
        {attempts.length === 0 ? (
          <div className='m-0 rounded-xl border border-dashed border-[#d0af75] bg-[rgb(255_250_238/0.54)] p-3.5 leading-relaxed text-[#795f41] max-[560px]:p-3 max-[560px]:leading-normal max-[560px]:text-center'>
            还没有猜测。选好四个颜色后，点击“提交这一手”。
          </div>
        ) : (
          <ol className='m-0 grid list-none gap-2 p-0'>
            {attempts.map((attempt, index) => (
              <li
                className='grid grid-cols-[--spacing(8)_minmax(0,1fr)_minmax(--spacing(28),auto)] items-center gap-3 rounded-xl border border-[#dfccaa] bg-[linear-gradient(100deg,rgb(255_253_245/0.84),rgb(247_235_209/0.56))] px-2.5 py-2 shadow-[inset_0_1px_rgb(255_255_255/0.72)] max-[560px]:grid-cols-[1fr_auto_1fr] max-[560px]:gap-1 max-[560px]:px-1.5 max-[560px]:py-2 max-[560px]:*:data-code-chips:justify-self-center max-[560px]:*:data-code-chips:flex-nowrap max-[560px]:*:data-code-chips:gap-px max-[560px]:**:data-color-chip:size-[clamp(--spacing(9),11vw,--spacing(11))] max-[560px]:**:data-result-icons:min-w-0 max-[560px]:**:data-result-icons:justify-center max-[560px]:**:data-result-icons:gap-0.5 max-[560px]:**:data-result-icons:px-1.5 max-[560px]:**:data-result-icons:py-1.5 max-[560px]:**:data-result-icon:size-4'
                key={attempt.id}
              >
                <span className='grid size-7 place-items-center rounded-full border border-[#af7d3e] bg-[radial-gradient(circle_at_35%_30%,#fff2ca,#e5c487)] text-sm font-black text-[#785127] max-[560px]:size-6'>
                  {index + 1}
                </span>
                <CodeChips code={attempt.guess} small />
                <ResultIcons value={attempt.result} />
              </li>
            ))}
          </ol>
        )}
        {!finished && (
          <div className='mt-3 flex items-center justify-center gap-2.5 border-t border-dashed border-[#d8bc85] pt-3 text-xs font-extrabold text-[#7a6042]'>
            <span>想直接结束本题？</span>
            <button
              type='button'
              className='min-h-9 cursor-pointer rounded-lg border border-[#b28a56] bg-[linear-gradient(#fff8e7,#efdcb6)] px-4 text-xs font-black text-[#76522a] shadow-[inset_0_1px_rgb(255_255_255/0.8),0_2px_0_rgb(104_72_32/0.12)] transition-[filter] hover:brightness-[1.04] focus-visible:outline-3 focus-visible:outline-[#2f8ba0] focus-visible:outline-offset-3'
              onClick={() => setAnswerVisible(true)}
            >
              显示答案
            </button>
          </div>
        )}
      </section>

      <section className={cn(panelClass, 'mt-6.5 overflow-visible max-[560px]:mt-3')} aria-labelledby='practice-title'>
        <div className='mb-4.5 flex items-start justify-between gap-4.5 max-[560px]:mb-3 max-[560px]:items-center max-[560px]:gap-2.5'>
          <div>
            <h2 className={headingClass} id='practice-title'>
              第 {attempts.length + 1} 次猜测
            </h2>
            <p className='mt-0 mb-3.5 text-sm text-[#71583d] max-[560px]:mb-2.5 max-[560px]:text-center'>点击一格选择宝石，选中后会自动跳到下一格。</p>
          </div>
          <span className='grid h-11 min-w-12 place-items-center rounded-lg border border-[#ba8a47] bg-[linear-gradient(135deg,#fae9bd,#e2bd77)] text-xl font-extrabold text-[#70471b] shadow-[inset_0_0_0_2px_rgb(255_248_225/0.53)]'>
            {attempts.length}
          </span>
        </div>

        {finished ? (
          <div
            className={cn(
              'grid justify-items-start gap-2.5 rounded-xl border p-4.5',
              solved ? 'border-[#99ad6c] bg-[linear-gradient(135deg,#f4f5d4,#dcecc7)]' : 'border-[#b89b64] bg-[linear-gradient(135deg,#fff5d9,#f1dfb6)]'
            )}
          >
            <p className={cn('m-0 text-base font-black', solved ? 'text-[#375a37]' : 'text-[#68451f]')}>{solved ? '答对了！四个位置都正确。' : '已显示本题答案。'}</p>
            <p className={cn('m-0 text-sm font-black', solved ? 'text-[#526c3f]' : 'text-[#765328]')}>本题答案</p>
            <CodeChips code={answer} />
            <button type='button' className={secondaryButtonClass} onClick={newQuestion}>
              开始下一题
            </button>
          </div>
        ) : (
          <div className='grid grid-cols-1 justify-items-center gap-4 max-[560px]:gap-2.5'>
            <GemInput value={guess} onChange={setGuess} label='选择四个颜色' centered />
            <button type='button' className={cn(primaryButtonClass, 'min-h-12 max-w-xl')} onClick={submitGuess}>
              提交这一手
            </button>
          </div>
        )}
      </section>
    </main>
  )
}
