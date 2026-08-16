const { dbQuery } = require('../db');
const { getScrapedInsight, scrapeAndEnrichPlace } = require('./aiScraperService');
const { getSeededPattern } = require('./demoSimulatorService');

/**
 * Unified Prediction Engine for WaitLess
 * Combines:
 * 1. External APIs Baseline (Google/OSM)
 * 2. Live User-Generated Reports (with exponential time-decay & trust scores)
 * 3. Hackathon Seeded Data Patterns
 * 4. AI Scraper Web Mentions & Sentiment
 */

async function calculateCrowdPrediction(place, userReports = []) {
  const placeId = String(place.id || 'unknown_place');
  const now = Date.now();
  const currentDay = new Date().getDay();
  const currentHour = new Date().getHours();

  // 1. External Baseline API Score (0 - 100)
  const baselineScore = typeof place.baselineBusyness === 'number' ? place.baselineBusyness : 50;

  // 2. Hackathon Seeded Pattern Score (0 - 100)
  let seededScore = await getSeededPattern(placeId, currentDay, currentHour);
  seededScore = typeof seededScore === 'number' ? seededScore : 45;

  // 3. AI Agent Web Scraper Sentiment (0 - 100)
  let scrapedInsight = await getScrapedInsight(placeId);
  if (!scrapedInsight) {
    scrapedInsight = await scrapeAndEnrichPlace(placeId, place.name || 'Venue');
  }
  const aiScore = (scrapedInsight && typeof scrapedInsight.sentiment_score === 'number')
    ? scrapedInsight.sentiment_score
    : 50;

  // 4. Live User-Generated Reports Aggregation (Time-Decay Weighted)
  let totalUserWeight = 0;
  let weightedUserScoreSum = 0;
  let recentReportCount = 0;

  if (Array.isArray(userReports)) {
    userReports.forEach(report => {
      const ageMinutes = (now - report.timestamp) / (1000 * 60);
      if (ageMinutes <= 240) {
        const timeDecayFactor = Math.exp(-ageMinutes / 30);
        const trustWeight = (report.trust_score || 1.0) * timeDecayFactor;

        let reportBusyness = 50;
        if (typeof report.wait_time_mins === 'number') {
          reportBusyness = Math.min(100, Math.max(5, report.wait_time_mins * 2.5));
        } else if (report.crowd_level) {
          reportBusyness = report.crowd_level === 'Low' ? 25 : report.crowd_level === 'Moderate' ? 50 : report.crowd_level === 'High' ? 75 : 95;
        }

        weightedUserScoreSum += reportBusyness * trustWeight;
        totalUserWeight += trustWeight;
        recentReportCount++;
      }
    });
  }

  const userReportScore = totalUserWeight > 0 ? (weightedUserScoreSum / totalUserWeight) : null;

  // Dynamic Weights Calculation
  let wExternal = 0.30;
  let wSeeded = 0.25;
  let wAI = 0.15;
  let wUser = 0.30;

  if (userReportScore !== null && recentReportCount > 0) {
    wUser = Math.min(0.55, 0.30 + recentReportCount * 0.08);
    const remaining = 1.0 - wUser;
    wExternal = remaining * 0.45;
    wSeeded = remaining * 0.35;
    wAI = remaining * 0.20;
  } else {
    wUser = 0.0;
    wExternal = 0.45;
    wSeeded = 0.35;
    wAI = 0.20;
  }

  // Calculate Final Aggregated Busyness Score
  const rawFinalScore = (baselineScore * wExternal) + (seededScore * wSeeded) + (aiScore * wAI) + ((userReportScore || 0) * wUser);
  const finalScore = Math.min(100, Math.max(5, Math.round(rawFinalScore || 40)));

  // Map to Crowd Level
  let crowdLevel = 'Low';
  let waitTimeMins = Math.max(2, Math.round(finalScore * 0.35));
  if (finalScore >= 80) {
    crowdLevel = 'Packed';
  } else if (finalScore >= 60) {
    crowdLevel = 'High';
  } else if (finalScore >= 35) {
    crowdLevel = 'Moderate';
  } else {
    crowdLevel = 'Low';
  }

  // Calculate Confidence Score
  let baseConfidence = 75;
  if (recentReportCount > 0) baseConfidence += Math.min(18, recentReportCount * 5);
  if (scrapedInsight) baseConfidence += 4;
  const confidence = Math.min(98, baseConfidence);

  return {
    placeId,
    placeName: place.name,
    crowdLevel,
    calculatedBusyness: finalScore,
    estimatedWaitTime: `${waitTimeMins} mins`,
    confidence: `${confidence}%`,
    breakdown: {
      externalApiBaseline: { score: Math.round(baselineScore), weight: `${Math.round(wExternal * 100)}%` },
      userReports: { score: userReportScore !== null ? Math.round(userReportScore) : 'N/A', count: recentReportCount, weight: `${Math.round(wUser * 100)}%` },
      aiWebScraper: { score: Math.round(aiScore), summary: scrapedInsight ? scrapedInsight.summary_text : 'Parsed web reviews', weight: `${Math.round(wAI * 100)}%` },
      seededHackathonData: { score: Math.round(seededScore), weight: `${Math.round(wSeeded * 100)}%` }
    },
    updatedAt: now
  };
}

module.exports = {
  calculateCrowdPrediction
};
