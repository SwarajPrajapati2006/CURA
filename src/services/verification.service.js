const { openfdaClient } = require('../config/openfda');
const { calculateCredibility } = require('./credibility.service');
const { getCache, setCache } = require('../utils/cache');
const { withRetry } = require('../utils/aiPatterns');

/**
 * Verifies a claim against OpenFDA.
 * Extracts drug and side effect to look up FAERS records.
 */
const verifyClaim = async (drug, sideEffect) => {
  let fdaMatch = false;

  try {
    // 1. Validate if drug is required
    if (!drug || !sideEffect) {
       throw new Error('Both drug and side effect are required for verification.');
    }

    const cacheKey = `verify_${drug}_${sideEffect}`;
    const cached = getCache(cacheKey);
    if (cached) {
      console.log(`[Cache hit] Verify claim for drug: ${drug}, effect: ${sideEffect}`);
      return cached;
    }

    // 2. Query OpenFDA
    const queryStr = `patient.drug.medicinalproduct:"${drug}" AND patient.reaction.reactionmeddrapt:"${sideEffect}"`;
    
    // Check if there are any exact matches in FDA adverse events
    // We wrap this external call in withRetry as well to ensure robust reliability
    const response = await withRetry(async () => {
      // Simulate FDA rate limit occasionally
      if (Math.random() < 0.1) throw new Error("FDA API Rate Limit Simulated");

      return await openfdaClient.get('/event.json', {
        params: {
          search: queryStr,
          limit: 1
        }
      });
    }, 3, 1000);

    if (response.data && response.data.results && response.data.results.length > 0) {
      fdaMatch = true;
    }
  } catch (err) {
    if (err.response && err.response.status === 404) {
      // 404 from FDA means no match found, this is fine, it just means not verified
      fdaMatch = false;
    } else {
      console.error(`FDA API Error after retries for drug ${drug} and effect ${sideEffect}:`, err.message);
      // Fallback: gracefully fail the FDA matching so credibility score just doesn't get the FDA bonus.
      fdaMatch = false;
    }
  }

  // Use mock values for Reddit frequency and upvote weight right now 
  // since these likely require DB aggregation which isn't described yet.
  const redditFrequency = 0.8;
  const upvoteWeight = 0.5;

  const score = calculateCredibility(fdaMatch, redditFrequency, upvoteWeight);

  const result = {
    verified: fdaMatch,
    credibility_score: score
  };
  
  if (drug && sideEffect) {
    const cacheKey = `verify_${drug}_${sideEffect}`;
    setCache(cacheKey, result);
  }

  return result;
};

module.exports = {
  verifyClaim
};
