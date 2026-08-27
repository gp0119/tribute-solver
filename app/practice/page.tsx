'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import confetti from 'canvas-confetti'

import { CodeChips, GemInput, ResultIcons } from '../components/gem-ui'
import { cn } from '../lib/cn'
import { randomCode, score, type ColorId, type Score } from '../lib/tribute'

type PracticeAttempt = { id: number; guess: ColorId[]; result: Score }

const DEFAULT_GUESS: ColorId[] = [0, 0, 1, 1]

function celebrate() {
  // ponytail: 1.5 秒烟花；需要更强庆典效果时再延长。
  const end = Date.now() + 1500
  const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 110, disableForReducedMotion: true }

  const interval = window.setInterval(() => {
    const timeLeft = end - Date.now()
    if (timeLeft <= 0) return window.clearInterval(interval)
    const particleCount = 50 * (timeLeft / 1500)

    confetti({ ...defaults, particleCount, origin: { x: Math.random() * 0.2 + 0.1, y: Math.random() - 0.2 } })
    confetti({ ...defaults, particleCount, origin: { x: Math.random() * 0.2 + 0.7, y: Math.random() - 0.2 } })
  }, 250)
}

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
    if (result.exact === 4) celebrate()
  }

  const newQuestion = () => {
    setAnswer(randomCode())
    setGuess(DEFAULT_GUESS)
    setAttempts([])
    setAnswerVisible(false)
  }

  return (
    <main className='game-shell game-shell--practice'>
      <header className='game-header'>
        <div className='game-brand'>
          <p className='game-eyebrow'>DON&apos;T STARVE TOGETHER · MEDAL MOD</p>
          <div className='flex items-center gap-2.5'>
            <Image className='game-divider-icon game-divider-icon--large' src='/tribute-box.png' alt='' width={64} height={64} />
            <h1 className='game-title'>奉纳符做题</h1>
          </div>
          <p className='game-subtitle'>网页随机出题</p>
        </div>
        <div className='game-actions game-actions--practice'>
          <nav className='game-nav' aria-label='页面导航'>
            <Link className='game-nav-link' href='/'>
              推演器
            </Link>
            <Link className='game-nav-link game-nav-link--active' href='/practice'>
              做题
            </Link>
          </nav>
          <button type='button' className='game-action-button game-action-button--practice' onClick={newQuestion}>
            换一题
          </button>
        </div>
      </header>

      <section className='game-rules' aria-labelledby='rules-title'>
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

      <section className='game-section mt-5 max-[560px]:mt-3' aria-labelledby='practice-history-title'>
        <div className='game-section-header'>
          <h2 className='game-heading' id='practice-history-title'>
            猜测结果
          </h2>
        </div>
        {attempts.length === 0 ? (
          <div className='game-empty-state'>还没有猜测。选好四个颜色后，点击“提交这一手”。</div>
        ) : (
          <ol className='game-history-list'>
            {attempts.map((attempt, index) => (
              <li className='practice-history-row' key={attempt.id}>
                <span className='history-step history-step--compact'>{index + 1}</span>
                <CodeChips code={attempt.guess} small />
                <ResultIcons value={attempt.result} />
              </li>
            ))}
          </ol>
        )}
        {!finished && (
          <div className='mt-3 flex items-center justify-center gap-2.5 border-t border-dashed border-[#d8bc85] pt-3 text-xs font-extrabold text-[#7a6042]'>
            <span>想直接结束本题？</span>
            <button type='button' className='reveal-button' onClick={() => setAnswerVisible(true)}>
              显示答案
            </button>
          </div>
        )}
      </section>

      <section className='game-panel mt-6.5 overflow-visible max-[560px]:mt-3' aria-labelledby='practice-title'>
        <div className='mb-4.5 flex items-center justify-between gap-4.5 max-[560px]:mb-3 max-[560px]:items-center max-[560px]:gap-2.5'>
          <h2 className='game-heading' id='practice-title'>
            第 {attempts.length + 1} 次猜测
          </h2>
          <span className='game-step-count'>{attempts.length}</span>
        </div>

        {finished ? (
          <div
            className={cn(
              'grid justify-items-start gap-2.5 rounded-xl border p-4.5',
              solved ? 'border-[#99ad6c] bg-[linear-gradient(135deg,#f4f5d4,#dcecc7)]' : 'border-[#b89b64] bg-[linear-gradient(135deg,#fff5d9,#f1dfb6)]'
            )}
          >
            <p className={cn('m-0 text-base font-black text-center w-full', solved ? 'text-[#375a37]' : 'text-[#68451f]')}>
              {solved ? '答对了！四个位置都正确。' : '已显示本题答案。'}
            </p>
            <CodeChips code={answer} />
            <button type='button' className='game-secondary-button' onClick={newQuestion}>
              开始下一题
            </button>
          </div>
        ) : (
          <div className='grid grid-cols-1 justify-items-center gap-4 max-[560px]:gap-2.5'>
            <GemInput value={guess} onChange={setGuess} label='选择四个颜色' centered />
            <button type='button' className='game-primary-button min-h-12 max-w-xl min-[561px]:mt-4' onClick={submitGuess}>
              提交这一手
            </button>
          </div>
        )}
      </section>
    </main>
  )
}
