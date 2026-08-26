'use client'

import Link from 'next/link'
import { useMemo, useState, useSyncExternalStore } from 'react'

import { CodeChips, GemInput, ResultIcons } from './components/gem-ui'
import { getAttemptsSnapshot, getServerAttemptsSnapshot, MAX_RECORDED_ATTEMPTS, parseAttemptsSnapshot, saveAttempts, subscribeToAttempts } from './lib/attempt-storage'
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
  return (
    <div className={`count-options inline-count-options ${tone}`} role='group' aria-label={label}>
      {[0, 1, 2, 3, 4].map((count) => (
        <button type='button' key={count} className={count === value ? 'selected' : ''} aria-pressed={count === value} disabled={count > maximum} onClick={() => onChange(count)}>
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

  return (
    <main className='app-shell'>
      <header className='topbar'>
        <div className='title-stack'>
          <span className='title-ornament' aria-hidden='true'>
            ✦
          </span>
          <p className='eyebrow'>DON&apos;T STARVE TOGETHER · MEDAL MOD</p>
          <h1>奉纳符推演器</h1>
          <p className='subtitle'>输入每行的颜色与图标数量，自动推断答案和下一手。</p>
        </div>
        <div className='header-actions'>
          <nav className='page-nav' aria-label='页面导航'>
            <Link className='page-link active' href='/'>
              推演器
            </Link>
            <Link className='page-link' href='/practice'>
              做题
            </Link>
          </nav>
          <button type='button' className='quiet-button' onClick={reset}>
            新一题
          </button>
        </div>
      </header>

      <section className='history-section history-section-top' aria-labelledby='history-title'>
        <div className='history-heading'>
          <div>
            <p className='section-kicker'>已记录</p>
            <h2 id='history-title'>推理记录</h2>
          </div>
        </div>
        {attempts.length === 0 ? (
          <div className='history-empty'>还没有记录。可以先照默认的“红 红 蓝 蓝”提交第一行。</div>
        ) : (
          <ol className='history-list'>
            {attempts.map((attempt, index) => (
              <li key={attempt.id}>
                <span className='attempt-number'>{index + 1}</span>
                <CodeChips code={attempt.guess} small />
                <span className='history-row-actions'>
                  <ResultIcons value={{ exact: attempt.exact, misplaced: attempt.misplaced }} compact />
                  <button
                    type='button'
                    className='delete-button'
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

      <div className='workspace-grid'>
        <section className='panel entry-panel' aria-labelledby='entry-title'>
          <div className='panel-heading'>
            <div>
              <p className='section-kicker'>录入本行</p>
              <h2 id='entry-title'>第 {Math.min(attempts.length + 1, MAX_RECORDED_ATTEMPTS)} 行</h2>
            </div>
            <span className='row-counter'>
              {attempts.length}/{MAX_RECORDED_ATTEMPTS}
            </span>
          </div>

          <div className='entry-selection-row'>
            <GemInput value={draftGuess} onChange={setDraftGuess} label='选择四个颜色' />
            <div className='selected-feedback' aria-label={`已选结果：完全正确 ${draftScore.exact}，颜色对位置错 ${draftScore.misplaced}`}>
              <p>选择结果</p>
              <div className='feedback-input-row'>
                <div className='feedback-result exact' aria-label={`完全正确 ${draftScore.exact} 个`}>
                  <span className='result-icon-list' aria-hidden='true'>
                    {Array.from({ length: draftScore.exact }, (_, index) => (
                      <b className='result-icon exact' key={index}>
                        ◎
                      </b>
                    ))}
                  </span>
                </div>
                <CountOptions label='完全正确' value={draftScore.exact} onChange={(value) => setScore('exact', value)} tone='exact' maximum={4 - draftScore.misplaced} />
              </div>
              <div className='feedback-input-row'>
                <div className='feedback-result misplaced' aria-label={`颜色对位置错 ${draftScore.misplaced} 个`}>
                  <span className='result-icon-list' aria-hidden='true'>
                    {Array.from({ length: draftScore.misplaced }, (_, index) => (
                      <b className='result-icon misplaced' key={index}>
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
            <div className='score-controls'>
              <button type='button' className='primary-button' onClick={addAttempt} disabled={tooManyRows}>
                记录这一行
              </button>
              {tooManyRows && <p className='inline-note'>已记录六行；可删掉某行后重新推断。</p>}
              {candidates.length > 1 && recommendation && (
                <div className='recommendation-card sidebar-recommendation'>
                  <p className='recommendation-label'>推荐下一手</p>
                  <CodeChips code={recommendation.code} small />
                  <p className='recommendation-copy'>下一条结果至多留下 {recommendation.worstCase} 种可能。</p>
                  <button type='button' className='secondary-button' onClick={() => setDraftGuess([...recommendation.code])}>
                    用作当前颜色
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>

        <section className='panel analysis-panel' aria-labelledby='analysis-title'>
          <div className='panel-heading'>
            <div>
              <p className='section-kicker'>即时推断</p>
              <h2 id='analysis-title'>{candidates.length === 0 ? '记录有矛盾' : isSolved ? '答案已确定' : '剩余候选'}</h2>
            </div>
            <strong className={candidates.length === 0 ? 'candidate-count error' : 'candidate-count'}>{candidates.length}</strong>
          </div>

          {candidates.length === 0 ? (
            <div className='empty-state'>
              <p>没有任何排列符合这些结果。请检查某一行的两种图标数量，或删除该行后重填。</p>
            </div>
          ) : isSolved ? (
            <div className='solution-card'>
              <p>最终答案</p>
              <CodeChips code={candidates[0]} />
            </div>
          ) : null}

          {candidates.length > 1 && candidates.length <= 24 && (
            <div className='candidate-list' aria-label='全部剩余候选'>
              <div className='candidate-list-heading'>
                <p>候选清单</p>
                <span>{candidates.length} 组</span>
              </div>
              <div className='candidate-grid'>
                {candidates.map((code) => (
                  <CodeChips code={code} small key={codeKey(code)} />
                ))}
              </div>
            </div>
          )}
          {candidates.length > 24 && <p className='candidate-hint'>候选较多时先使用推荐下一手，结果会大幅缩小范围。</p>}
        </section>
      </div>

      {showConflict && (
        <div className='conflict-backdrop' role='presentation' onClick={() => setShowConflict(false)}>
          <section className='conflict-dialog' role='alertdialog' aria-modal='true' aria-labelledby='conflict-title' onClick={(event) => event.stopPropagation()}>
            <span className='conflict-mark' aria-hidden='true'>
              !
            </span>
            <p className='section-kicker'>无法记录</p>
            <h2 id='conflict-title'>记录有矛盾</h2>
            <p>当前颜色和图标数量与已有记录无法同时成立，请检查后再提交。</p>
            <button type='button' className='primary-button' autoFocus onClick={() => setShowConflict(false)}>
              返回修改
            </button>
          </section>
        </div>
      )}
    </main>
  )
}
