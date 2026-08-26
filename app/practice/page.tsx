'use client';

import Link from 'next/link';
import { useState } from 'react';

import { CodeChips, GemInput, ResultIcons } from '../components/gem-ui';
import { randomCode, score, type ColorId, type Score } from '../lib/tribute';

type PracticeAttempt = { id: number; guess: ColorId[]; result: Score };

const DEFAULT_GUESS: ColorId[] = [0, 0, 1, 1];

export default function PracticePage() {
  const [answer, setAnswer] = useState<ColorId[]>(() => randomCode());
  const [guess, setGuess] = useState<ColorId[]>(DEFAULT_GUESS);
  const [attempts, setAttempts] = useState<PracticeAttempt[]>([]);
  const [answerVisible, setAnswerVisible] = useState(false);

  const lastAttempt = attempts.at(-1);
  const solved = lastAttempt?.result.exact === 4;
  const finished = Boolean(solved || answerVisible);

  const submitGuess = () => {
    if (finished) return;
    const result = score(guess, answer);
    setAttempts((current) => [...current, {
      id: Date.now(),
      guess: [...guess],
      result,
    }]);
  };

  const newQuestion = () => {
    setAnswer(randomCode());
    setGuess(DEFAULT_GUESS);
    setAttempts([]);
    setAnswerVisible(false);
  };

  return (
    <main className="app-shell practice-shell">
      <header className="topbar">
        <div className="title-stack">
          <span className="title-ornament" aria-hidden="true">✦</span>
          <p className="eyebrow">DON&apos;T STARVE TOGETHER · MEDAL MOD</p>
          <h1>奉纳符做题</h1>
          <p className="subtitle">网页随机出题，直接按游戏规则给出两种图标结果。</p>
        </div>
        <div className="header-actions">
          <nav className="page-nav" aria-label="页面导航">
            <Link className="page-link" href="/">推演器</Link>
            <Link className="page-link active" href="/practice">做题</Link>
          </nav>
          <button type="button" className="quiet-button" onClick={newQuestion}>换一题</button>
        </div>
      </header>

      <section className="notice practice-notice" aria-label="做题规则">
        <span className="notice-mark">!</span>
        <p>猜错后会保留提示，可不限次数继续猜测，直到答对。<strong>两种图标只表示数量，不对应某个位置。</strong></p>
      </section>

      <section className="rules-card" aria-labelledby="rules-title">
        <p className="section-kicker">游戏规则</p>
        <h2 id="rules-title">怎么判断结果？</h2>
        <ul>
          <li>答案由 4 个备选颜色随机排列组成，可以重复。</li>
          <li>根据每次记录，推理颜色种类和排列顺序。</li>
          <li>两种图标只表示数量，没有位置映射关系。</li>
          <li><b className="result-icon exact" aria-hidden="true">◎</b> 表示“颜色和位置都正确”的数量。</li>
          <li><b className="result-icon misplaced" aria-hidden="true">◉</b> 表示“颜色正确但位置错误”的数量。</li>
        </ul>
      </section>

      <section className="panel practice-panel" aria-labelledby="practice-title">
        <div className="panel-heading practice-heading">
          <div><p className="section-kicker">直接做题</p><h2 id="practice-title">第 {attempts.length + 1} 次猜测</h2></div>
          <span className="row-counter">{attempts.length}</span>
        </div>

        {finished ? (
          <div className={solved ? 'practice-finish solved' : 'practice-finish revealed'}>
            <p className="practice-finish-title">{solved ? '答对了！四个位置都正确。' : '已显示本题答案。'}</p>
            <p>本题答案</p>
            <CodeChips code={answer} />
            <button type="button" className="secondary-button" onClick={newQuestion}>开始下一题</button>
          </div>
        ) : (
          <>
            <p className="practice-prompt">点击一格选择宝石，选中后会自动跳到下一格。</p>
            <div className="practice-entry-row">
              <GemInput value={guess} onChange={setGuess} label="选择四个颜色" />
              <button type="button" className="primary-button" onClick={submitGuess}>提交这一手</button>
            </div>
          </>
        )}
      </section>

      <section className="history-section practice-history" aria-labelledby="practice-history-title">
        <div className="history-heading">
          <div><p className="section-kicker">本题记录</p><h2 id="practice-history-title">猜测结果</h2></div>
          <p>{attempts.length === 0 ? '提交后会立即显示游戏图标。' : `${attempts.length} 次`}</p>
        </div>
        {attempts.length === 0 ? (
          <div className="history-empty">还没有猜测。选好四个颜色后，点击“提交这一手”。</div>
        ) : (
          <ol className="practice-attempts">
            {attempts.map((attempt, index) => (
              <li key={attempt.id}>
                <span className="attempt-number">{index + 1}</span>
                <CodeChips code={attempt.guess} small />
                <ResultIcons value={attempt.result} />
              </li>
            ))}
          </ol>
        )}
        {!finished && (
          <div className="practice-reveal-row">
            <span>想直接结束本题？</span>
            <button type="button" className="reveal-button" onClick={() => setAnswerVisible(true)}>显示答案</button>
          </div>
        )}
      </section>
    </main>
  );
}
