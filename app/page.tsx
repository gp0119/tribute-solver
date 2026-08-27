'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useMemo, useState, useSyncExternalStore } from 'react'

import { CodeChips, GemInput, ResultIcons } from './components/gem-ui'
import { getAttemptsSnapshot, getServerAttemptsSnapshot, MAX_RECORDED_ATTEMPTS, parseAttemptsSnapshot, saveAttempts, subscribeToAttempts } from './lib/attempt-storage'
import { cn } from './lib/cn'
import { codeKey, findBestRecommendation, findMatchingCodes, type ColorId, type Score } from './lib/tribute'

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
  const selectedClass = tone === 'exact' ? 'score-count-option--exact' : 'score-count-option--misplaced'

  return (
    <div className='score-count-options' role='group' aria-label={label}>
      {[0, 1, 2, 3, 4].map((count) => (
        <button
          type='button'
          key={count}
          className={cn('score-count-option', count === value && selectedClass)}
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
  const candidateCountClass = candidates.length === 0 ? 'candidate-count candidate-count--conflict' : 'candidate-count candidate-count--available'

  return (
    <main className='game-shell'>
      <header className='game-header'>
        <div className='game-brand'>
          <p className='game-eyebrow'>DON&apos;T STARVE TOGETHER · MEDAL MOD</p>
          <div className='flex items-center gap-2'>
            <Image className='game-divider-icon game-divider-icon--large' src='/tribute-box.png' alt='' width={64} height={64} />
            <h1 className='game-title'>奉纳符推演器</h1>
          </div>
          <p className='game-subtitle'>输入每行的颜色与图标数量，自动推断答案和下一手。</p>
        </div>
        <div className='game-actions game-actions--solver'>
          <nav className='game-nav game-nav--solver' aria-label='页面导航'>
            <Link className='game-nav-link game-nav-link--active' href='/'>
              推演器
            </Link>
            <Link className='game-nav-link' href='/practice'>
              做题
            </Link>
          </nav>
          <button type='button' className='game-action-button game-action-button--solver' onClick={reset}>
            新一题
          </button>
        </div>
      </header>

      <section className='game-section mb-5 max-[560px]:mb-3' aria-labelledby='history-title'>
        <div className='mb-4 flex gap-2.5'>
          <h2 className='game-heading' id='history-title'>
            推理记录
          </h2>
        </div>
        {attempts.length === 0 ? (
          <div className='game-empty-state'>还没有记录。可以先照默认的“红 红 蓝 蓝”提交第一行。</div>
        ) : (
          <ol className='game-history-list'>
            {attempts.map((attempt, index) => (
              <li className='solver-history-row' key={attempt.id}>
                <span className='history-step'>{index + 1}</span>
                <CodeChips code={attempt.guess} small />
                <span className='solver-history-actions'>
                  <ResultIcons value={{ exact: attempt.exact, misplaced: attempt.misplaced }} compact />
                  <button
                    type='button'
                    className='history-delete-button'
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
        <section className='game-panel overflow-visible' aria-labelledby='entry-title'>
          <div className='flex items-start gap-2.5'>
            <h2 className='game-heading' id='entry-title'>
              第 {Math.min(attempts.length + 1, MAX_RECORDED_ATTEMPTS)} 行
            </h2>
            <span className='game-step-count ml-auto'>
              {attempts.length}/{MAX_RECORDED_ATTEMPTS}
            </span>
          </div>

          <div className='solver-entry-grid'>
            <GemInput value={draftGuess} onChange={setDraftGuess} label='选择四个颜色' />
            <div className='grid min-w-0 grid-rows-[auto_1fr_1fr] gap-1.5 rounded-lg border border-dashed border-[#c7aa76] bg-[rgb(255_252_242/0.58)] px-3 py-2.5'>
              <p className='mb-0.5 text-xs font-black tracking-[0.04em] text-[#785a34] max-[560px]:text-center'>选择结果</p>
              <div className='grid grid-cols-[minmax(--spacing(11),1fr)_auto] items-center gap-2'>
                <div className='flex min-h-7 items-center rounded-md bg-[rgb(211_242_235/0.7)] px-2 py-1 text-xs font-black text-[#315e60] max-[560px]:justify-center'>
                  <span className='inline-flex min-w-0 items-center gap-1 **:data-result-icon:size-6' aria-hidden='true'>
                    {Array.from({ length: draftScore.exact }, (_, index) => (
                      <b data-result-icon className='result-icon bg-top-left' key={index}>
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
                      <b data-result-icon className='result-icon bg-top-right' key={index}>
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
              <button type='button' className='game-primary-button game-primary-button--raised' onClick={addAttempt} disabled={tooManyRows}>
                记录这一行
              </button>
              {tooManyRows && <p className='m-0 text-sm text-[#875a34]'>已记录六行；可删掉某行后重新推断。</p>}
              {candidates.length > 1 && recommendation && (
                <div className='relative overflow-hidden rounded-xl border border-[#9cad72] bg-[linear-gradient(135deg,#fbf7db,#e0eec9)] p-3.5 max-[560px]:text-center'>
                  <p className='relative z-1 mb-2 text-xs font-black tracking-[0.08em] text-[#4f743f]'>推荐下一手</p>
                  <CodeChips code={recommendation.code} small />
                  <p className='relative z-1 my-2 text-xs text-[#547052]'>下一条结果至多留下 {recommendation.worstCase} 种可能。</p>
                  <button type='button' className='game-secondary-button game-secondary-button--raised px-2.5 py-2 text-xs' onClick={() => setDraftGuess([...recommendation.code])}>
                    用作当前颜色
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>

        <section className='game-panel flex min-h-0 flex-col overflow-hidden' aria-labelledby='analysis-title'>
          <div className='flex items-start justify-between gap-4.5 max-[560px]:items-center max-[560px]:gap-2.5'>
            <h2 className='game-heading' id='analysis-title'>
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
                  <div className='candidate-code' key={codeKey(code)}>
                    <CodeChips code={code} small />
                  </div>
                ))}
              </div>
            </div>
          )}
          {candidates.length > 24 && <p className='game-empty-state game-empty-state--relaxed-mobile mt-auto'>候选较多时先使用推荐下一手，结果会大幅缩小范围。</p>}
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
            <h2 className='game-heading mb-2.5' id='conflict-title'>
              记录有矛盾
            </h2>
            <p className='m-0 leading-relaxed text-[#76543a]'>当前颜色和图标数量与已有记录无法同时成立，请检查后再提交。</p>
            <button type='button' className='game-primary-button game-primary-button--raised mt-4.5' autoFocus onClick={() => setShowConflict(false)}>
              返回修改
            </button>
          </section>
        </div>
      )}
    </main>
  )
}
