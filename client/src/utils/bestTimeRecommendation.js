/**
 * Recommends the best time to visit based on historical hourly crowd data.
 * Uses a sliding window (default 2 hours) to find the period with the lowest average density.
 *
 * @param {Array} hourlyCrowd - Array of historical crowd data objects { hour, densityPercent, level, isPeakLow }
 * @param {number} windowSize - Number of consecutive hours to consider for a block (default: 2)
 * @returns {Object} { recommendedTime: string, confidence: string, reason: string }
 */
export function recommendBestTime(hourlyCrowd, windowSize = 2) {
    if (!hourlyCrowd || hourlyCrowd.length === 0) {
        return {
            recommendedTime: "Unknown",
            confidence: "low",
            reason: "Not enough historical data available yet."
        };
    }

    if (hourlyCrowd.length < windowSize) {
        // If we have very little data, just return the lowest single hour we have
        const lowest = [...hourlyCrowd].sort((a, b) => a.densityPercent - b.densityPercent)[0];
        return {
            recommendedTime: lowest.hour,
            confidence: "medium",
            reason: "Based on limited recent trends."
        };
    }

    let minAvgDensity = Infinity;
    let bestStartIndex = 0;

    // Sliding window over the array
    for (let i = 0; i <= hourlyCrowd.length - windowSize; i++) {
        let sumDensity = 0;
        for (let j = 0; j < windowSize; j++) {
            sumDensity += hourlyCrowd[i + j].densityPercent;
        }
        const avgDensity = sumDensity / windowSize;

        if (avgDensity < minAvgDensity) {
            minAvgDensity = avgDensity;
            bestStartIndex = i;
        }
    }

    const startHour = hourlyCrowd[bestStartIndex].hour;
    const endHour = hourlyCrowd[bestStartIndex + windowSize - 1].hour; // inclusive end hour, so "3 PM - 4 PM" block.
    
    // To make it look like a range (e.g., "3 PM - 5 PM"), we can take the start hour, and for the end hour, we might want to represent the *end* of that block.
    // If the data is "3 PM" and "4 PM", the block spans from 3:00 to 5:00.
    // We can just add 1 hour to the last item's hour if we want, or simply use "startHour - endHour" as a rough approximation.
    // Let's create a helper to get the "next" hour string for the end of the window.
    
    const getNextHourStr = (hourStr) => {
        const match = hourStr.match(/(\d+)\s*(AM|PM)/i);
        if (!match) return hourStr;
        let h = parseInt(match[1]);
        let ampm = match[2].toUpperCase();
        
        h += 1;
        if (h === 12) {
            ampm = ampm === 'AM' ? 'PM' : 'AM';
        } else if (h > 12) {
            h = 1;
        }
        return `${h} ${ampm}`;
    };

    const finalEndHour = getNextHourStr(endHour);
    const recommendedTime = `${startHour} - ${finalEndHour}`;

    let confidence = "high";
    let reason = "Usually Low Crowd";

    if (hourlyCrowd.length < 5) {
        confidence = "medium";
        reason = "Based on limited historical data";
    }

    return {
        recommendedTime,
        confidence,
        reason
    };
}
