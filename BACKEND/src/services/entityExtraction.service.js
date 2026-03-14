const { bytezClient } = require('../config/bytez');
const { parseExtractedEntities } = require('../utils/medicalParser');
const { getCache, setCache } = require('../utils/cache');
const { withRetry, buildHumanizedPrompt, parseStructuredOutput } = require('../utils/aiPatterns');

/**
 * Extracts medical entities from a comment ID by querying MongoDB and sending text to Bytez API.
 * (Mocked MongoDB fetching for now)
 */
const extractEntities = async (commentId) => {
  try {
    const cacheKey = `extract_${commentId}`;
    const cached = getCache(cacheKey);
    if (cached) {
      console.log(`[Cache hit] Extract entities for ${commentId}`);
      return cached;
    }

    // In a real scenario, fetch the comment from DB:
    // const comment = await CommentModel.findById(commentId);
    // const text = comment.body;
    
    // For now, mock the text:
    const text = `I took 20mg of Accutane and by Week 2 I had severe dry lips.`;

    const systemPrompt = buildHumanizedPrompt();
    
    // Fallback schema if extraction fails completely
    const fallbackExtraction = {
      drug: null,
      side_effect: null,
      dosage: null,
      timeline_marker: null
    };

    console.log(`[Mock] Calling LLM API for comment ${commentId} with System Prompt: "${systemPrompt.substring(0, 50)}..."`);
    
    // We wrap the API call in withRetry to ensure Reliability AI Pattern
    const rawAiResponse = await withRetry(async () => {
      // Make an API call to Bytez.
      /*
      const response = await bytezClient.post('/chat/completions', { 
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: text }
        ]
      });
      return response.data.choices[0].message.content;
      */
      
      // Simulating a flaky LLM text response that occasionally fails:
      if (Math.random() < 0.2) {
         throw new Error("Simulated 503 Service Unavailable");
      }
      
      // Simulating the raw string output from an LLM formatted as markdown JSON
      return `\`\`\`json\n{\n  "drug": "Accutane",\n  "side_effect": "dry lips",\n  "dosage": "20mg",\n  "timeline_marker": "Week 2"\n}\n\`\`\``;
    }, 3, 1000);

    // Parse the structured output using our utility (Structured Outputs Pattern)
    const extractedData = parseStructuredOutput(rawAiResponse, fallbackExtraction);

    // Existing medical parser logic
    const result = parseExtractedEntities(extractedData);
    
    setCache(cacheKey, result);
    return result;

  } catch (error) {
    console.error(`Error extracting entities after retries: ${error.message}`);
    // Return graceful fallback rather than bursting the app
    return parseExtractedEntities({
      drug: null,
      side_effect: null,
      dosage: null,
      timeline_marker: null
    });
  }
};

module.exports = {
  extractEntities
};
