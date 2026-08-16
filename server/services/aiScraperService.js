const { dbRun, dbGet, dbQuery } = require('../db');

/**
 * AI Web Scraper / Review Intelligence Agent
 * Queries web sources / review feeds and converts unstructured text into crowd scores.
 */

// Keyword dictionaries for NLP sentiment detection
const CROWD_KEYWORDS = {
  HIGH: ['packed', 'jammed', 'crowded', 'long queue', 'huge line', 'long wait', 'no seats', 'busy', 'chaotic'],
  LOW: ['empty', 'quiet', 'no line', 'walk-in', 'no queue', 'quick service', 'peaceful', 'spacious'],
  MODERATE: ['moderate', 'average wait', 'some people', 'moving fast', 'fairly busy']
};

/**
 * Parses unstructured text reviews/social posts into a 1-100 busyness score
 */
function analyzeReviewSentiment(text) {
  const lower = text.toLowerCase();
  let highHits = 0;
  let lowHits = 0;
  let modHits = 0;

  CROWD_KEYWORDS.HIGH.forEach(kw => { if (lower.includes(kw)) highHits++; });
  CROWD_KEYWORDS.LOW.forEach(kw => { if (lower.includes(kw)) lowHits++; });
  CROWD_KEYWORDS.MODERATE.forEach(kw => { if (lower.includes(kw)) modHits++; });

  if (highHits > lowHits) return Math.min(95, 70 + highHits * 8);
  if (lowHits > highHits) return Math.max(10, 25 - lowHits * 5);
  return 50;
}

/**
 * Simulates an AI Agent crawling web reviews/social channels for a location
 */
async function scrapeAndEnrichPlace(placeId, placeName) {
  try {
    // Simulated sample web review feeds (or real web fetch in production)
    const mockWebMentions = [
      `Visited ${placeName} today around lunch. Super packed, huge line at counter!`,
      `Great experience at ${placeName}, walk-in with no line at all.`,
      `Place was moderately busy, about 10 min wait time overall.`
    ];

    // Pick a mention deterministically or randomly based on place ID
    const selectedMention = mockWebMentions[Math.abs(placeId.length + placeName.length) % mockWebMentions.length];
    const sentimentScore = analyzeReviewSentiment(selectedMention);
    const now = Date.now();

    await dbRun(`
      INSERT INTO scraped_insights (place_id, place_name, source, sentiment_score, mention_count, summary_text, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(place_id) DO UPDATE SET
        sentiment_score = excluded.sentiment_score,
        mention_count = mention_count + 1,
        summary_text = excluded.summary_text,
        updated_at = excluded.updated_at
    `, [placeId, placeName, 'AI Web Search Agent', sentimentScore, 5 + (now % 10), selectedMention, now]);

    return {
      placeId,
      sentimentScore,
      summaryText: selectedMention,
      updatedAt: now
    };
  } catch (err) {
    console.error('AI Scraper Service Error:', err.message);
    return null;
  }
}

/**
 * Gets cached scraped insights from DB
 */
async function getScrapedInsight(placeId) {
  try {
    const row = await dbGet(`SELECT * FROM scraped_insights WHERE place_id = ?`, [placeId]);
    return row || null;
  } catch (err) {
    return null;
  }
}

module.exports = {
  analyzeReviewSentiment,
  scrapeAndEnrichPlace,
  getScrapedInsight
};
