const BPE = (() => {
  const corpora = {
    play: 'play play play plays player replay playful',
    ing: 'sing ring wing king bring singing ringing'
  };

  function pairs(words) {
    const counts = new Map();
    for (const word of words) {
      for (let i = 1; i < word.length; i++) {
        const pair = [word[i - 1], word[i]];
        const key = JSON.stringify(pair);
        if (!counts.has(key)) counts.set(key, { pair, count: 0 });
        counts.get(key).count++;
      }
    }
    // Stable sort retains the first occurrence for tied counts.
    return [...counts.values()].sort((a, b) => b.count - a.count);
  }

  function merge(tokens, [left, right]) {
    const next = [];
    for (let i = 0; i < tokens.length; i++) {
      if (tokens[i] === left && tokens[i + 1] === right) {
        next.push(left + right);
        i++;
      } else next.push(tokens[i]);
    }
    return next;
  }

  function train(corpus, budget = 5) {
    let words = corpus.trim().split(/\s+/u).filter(Boolean).map(word => [...word]);
    const rounds = [];
    while (rounds.length < budget) {
      const candidates = pairs(words);
      if (!candidates.length) break;
      const { pair, count } = candidates[0];
      rounds.push({ pair, count, candidates, before: words });
      words = words.map(word => merge(word, pair));
    }
    return rounds;
  }

  function encode(text, rounds) {
    return rounds.reduce((tokens, round) => merge(tokens, round.pair), [...text]);
  }
  return { corpora, pairs, merge, train, encode };
})();
if (typeof module !== 'undefined') module.exports = BPE;
