/**
 * Estimates wait time based on real-time report and historical data.
 * @param {string} reportedLevel - The user reported level: 'low', 'medium', 'high'
 * @param {Array} hourlyCrowd - Historical hourly crowd data for the place
 * @returns {Object} { waitMin, label }
 */
export function estimateWaitTime(reportedLevel, hourlyCrowd) {
    const currentHour = new Date().getHours();
    
    // Convert 24h to '1 PM' format
    const formatHour = (h) => {
        const ampm = h >= 12 ? 'PM' : 'AM';
        const hr = h % 12 || 12;
        return `${hr} ${ampm}`;
    };
    
    const currentHourStr = formatHour(currentHour);
    const historicalData = hourlyCrowd?.find(h => h.hour === currentHourStr);
    
    // Base wait times in minutes
    const baseWaits = {
        low: 5,
        medium: 15,
        high: 45
    };
    
    let estimatedWait = baseWaits[reportedLevel];
    
    if (historicalData && historicalData.densityPercent) {
        // Multiplier based on historical density (e.g. 90% -> 1.4, 20% -> 0.7)
        const historyMultiplier = 1 + ((historicalData.densityPercent - 50) / 100); 
        
        // Blend 70% real-time and 30% historical prediction
        const realTimeWeight = 0.7;
        const historyWeight = 0.3;
        
        const historicalWaitPred = baseWaits[historicalData.level || 'medium'] * historyMultiplier;
        
        estimatedWait = Math.round((estimatedWait * realTimeWeight) + (historicalWaitPred * historyWeight));
    }
    
    // Apply sensible minimum and maximum bounds
    estimatedWait = Math.max(0, Math.min(estimatedWait, 120));
    
    // Determine the user-friendly label
    let label = "Not Busy";
    if (estimatedWait >= 30) {
        label = "Very Busy";
    } else if (estimatedWait >= 10) {
        label = "Moderate";
    }
    
    return {
        waitMin: estimatedWait,
        label: label
    };
}
