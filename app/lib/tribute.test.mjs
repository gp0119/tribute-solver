import assert from 'node:assert/strict';
import test from 'node:test';

import { parseAttemptsSnapshot } from './attempt-storage.ts';
import { ALL_CODES, findBestRecommendation, score } from './tribute.ts';

test('score handles exact, misplaced, and repeated colors', () => {
  assert.deepEqual(score([0, 0, 1, 1], [0, 1, 0, 1]), { exact: 2, misplaced: 2 });
  assert.deepEqual(score([0, 0, 0, 1], [0, 1, 1, 1]), { exact: 2, misplaced: 0 });
  assert.deepEqual(score([0, 1, 2, 3], [4, 5, 0, 1]), { exact: 0, misplaced: 2 });
});

test('score matches an independent implementation for every code pair', () => {
  const referenceScore = (guess, answer) => {
    let exact = 0;
    const guessCounts = Array(6).fill(0);
    const answerCounts = Array(6).fill(0);

    for (let index = 0; index < 4; index += 1) {
      if (guess[index] === answer[index]) exact += 1;
      else {
        guessCounts[guess[index]] += 1;
        answerCounts[answer[index]] += 1;
      }
    }

    let misplaced = 0;
    for (let index = 0; index < 6; index += 1) {
      misplaced += Math.min(guessCounts[index], answerCounts[index]);
    }
    return { exact, misplaced };
  };

  for (const guess of ALL_CODES) {
    for (const answer of ALL_CODES) {
      assert.deepEqual(score(guess, answer), referenceScore(guess, answer));
    }
  }
});

test('invalid or outdated browser data is discarded safely', () => {
  const valid = { id: 10, guess: [0, 1, 2, 3], exact: 1, misplaced: 2 };
  const duplicate = { ...valid };
  const invalidRows = [
    null,
    {},
    { id: 11, guess: [0, 1, 2, 9], exact: 0, misplaced: 0 },
    { id: 12, guess: [0, 1, 2, 3], exact: 3, misplaced: 2 },
  ];

  assert.deepEqual(parseAttemptsSnapshot('not json'), []);
  assert.deepEqual(parseAttemptsSnapshot(JSON.stringify([valid, duplicate, ...invalidRows])), [valid]);
});

test('the cached opening recommendation retains the verified optimum', () => {
  assert.deepEqual(findBestRecommendation(ALL_CODES), {
    code: [0, 0, 1, 1],
    worstCase: 256,
    solution: false,
  });
});
