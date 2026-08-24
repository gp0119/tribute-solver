export type ColorId = 0 | 1 | 2 | 3 | 4 | 5;

export type GemColor = {
  id: ColorId;
  name: string;
  swatch: string;
  edge: string;
  spriteTileX: string;
};

export type Score = { exact: number; misplaced: number };

export type ScoredGuess = {
  guess: ColorId[];
  exact: number;
  misplaced: number;
};

export type Recommendation = {
  code: ColorId[];
  worstCase: number;
  solution: boolean;
};

export const COLORS: GemColor[] = [
  { id: 0, name: '红', swatch: '#bc3938', edge: '#792321', spriteTileX: '-358px' },
  { id: 1, name: '蓝', swatch: '#3571b8', edge: '#194170', spriteTileX: '-431px' },
  { id: 2, name: '紫', swatch: '#8754a4', edge: '#512e6d', spriteTileX: '-505px' },
  { id: 3, name: '橙', swatch: '#d58b35', edge: '#8d4e13', spriteTileX: '-579px' },
  { id: 4, name: '黄', swatch: '#d6bc3c', edge: '#877317', spriteTileX: '-653px' },
  { id: 5, name: '绿', swatch: '#3e9b67', edge: '#1f5b3d', spriteTileX: '-727px' },
];

export const COLOR_BY_ID = new Map(COLORS.map((color) => [color.id, color]));
export const ALL_CODES: ColorId[][] = [];

for (let first = 0; first < 6; first += 1) {
  for (let second = 0; second < 6; second += 1) {
    for (let third = 0; third < 6; third += 1) {
      for (let fourth = 0; fourth < 6; fourth += 1) {
        ALL_CODES.push([first, second, third, fourth] as ColorId[]);
      }
    }
  }
}

export function score(guess: ColorId[], answer: ColorId[]): Score {
  let exact = 0;
  const guessCounts = [0, 0, 0, 0, 0, 0];
  const answerCounts = [0, 0, 0, 0, 0, 0];

  for (let index = 0; index < 4; index += 1) {
    if (guess[index] === answer[index]) exact += 1;
    guessCounts[guess[index]] += 1;
    answerCounts[answer[index]] += 1;
  }

  let sharedColors = 0;
  for (let index = 0; index < 6; index += 1) {
    sharedColors += Math.min(guessCounts[index], answerCounts[index]);
  }
  return { exact, misplaced: sharedColors - exact };
}

export function scoreKey(value: Score) {
  return value.exact * 5 + value.misplaced;
}

export function codeKey(code: ColorId[]) {
  return code.join('');
}

export function findMatchingCodes(attempts: ScoredGuess[]): ColorId[][] {
  return ALL_CODES.filter((answer) => attempts.every((attempt) => {
    const result = score(attempt.guess, answer);
    return result.exact === attempt.exact && result.misplaced === attempt.misplaced;
  }));
}

export function randomCode(): ColorId[] {
  return Array.from({ length: 4 }, () => Math.floor(Math.random() * 6) as ColorId);
}

const INITIAL_RECOMMENDATION: Recommendation = {
  code: [0, 0, 1, 1],
  worstCase: 256,
  solution: false,
};

export function findBestRecommendation(candidates: ColorId[][]): Recommendation | null {
  if (candidates.length === 0) return null;
  if (candidates.length === 1) {
    return { code: candidates[0], worstCase: 1, solution: true };
  }

  // The complete 1,296-code opening always has the same optimum. Keeping it
  // here avoids 1,679,616 score calculations during the first render.
  if (candidates.length === ALL_CODES.length) {
    return { ...INITIAL_RECOMMENDATION, code: [...INITIAL_RECOMMENDATION.code] };
  }

  const candidateKeys = new Set(candidates.map(codeKey));
  let best: {
    code: ColorId[];
    worstCase: number;
    sumOfSquares: number;
    outcomes: number;
    isCandidate: boolean;
  } | null = null;

  for (const guess of ALL_CODES) {
    const partitions = new Uint16Array(25);
    for (const answer of candidates) partitions[scoreKey(score(guess, answer))] += 1;

    let worstCase = 0;
    let sumOfSquares = 0;
    let outcomes = 0;
    for (const size of partitions) {
      if (size > 0) {
        worstCase = Math.max(worstCase, size);
        sumOfSquares += size * size;
        outcomes += 1;
      }
    }

    const current = {
      code: guess,
      worstCase,
      sumOfSquares,
      outcomes,
      isCandidate: candidateKeys.has(codeKey(guess)),
    };
    if (
      !best ||
      current.worstCase < best.worstCase ||
      (current.worstCase === best.worstCase && current.sumOfSquares < best.sumOfSquares) ||
      (current.worstCase === best.worstCase && current.sumOfSquares === best.sumOfSquares && current.outcomes > best.outcomes) ||
      (current.worstCase === best.worstCase && current.sumOfSquares === best.sumOfSquares && current.outcomes === best.outcomes && current.isCandidate && !best.isCandidate)
    ) best = current;
  }

  return best ? { code: best.code, worstCase: best.worstCase, solution: false } : null;
}
