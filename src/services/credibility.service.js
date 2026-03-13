/**
 * Calculates a credibility score for a claim.
 * Formula defined in backend_plan_B.md:
 * score = 0.5 * FDA_match + 0.3 * Reddit_frequency + 0.2 * upvote_weight
 */

const calculateCredibility = (fdaMatch, redditFrequency, upvoteWeight) => {
  // fdaMatch: boolean or 1/0
  const fdaScore = fdaMatch ? 1 : 0;
  
  // redditFrequency: normalized 0 to 1 value based on how often the side effect is discussed.
  const frequencyScore = Math.min(Math.max(redditFrequency, 0), 1); 
  
  // upvoteWeight: normalized 0 to 1 value representing average community consensus/upvotes.
  const upvoteScore = Math.min(Math.max(upvoteWeight, 0), 1);
  
  let score = (0.5 * fdaScore) + (0.3 * frequencyScore) + (0.2 * upvoteScore);
  
  // Ensure score is within 0-1 bounds and rounded to 2 decimal places
  score = Math.round(score * 100) / 100;
  
  return score;
};

module.exports = {
  calculateCredibility
};
