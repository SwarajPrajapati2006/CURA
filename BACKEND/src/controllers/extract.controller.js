const { extractEntities } = require('../services/entityExtraction.service');

const extract = async (req, res) => {
  const { comment_id, text } = req.body;

  if (!comment_id && !text) {
    return res.status(400).json({ error: 'comment_id or text is required' });
  }

  try {
    const entities = text 
      ? await extractEntities(text, true)
      : await extractEntities(comment_id);
    res.json(entities);
  } catch (error) {
    console.error(`Extract Controller Error: ${error.message}`);
    res.status(500).json({ error: 'Failed to extract entities' });
  }
};

module.exports = {
  extract
};
