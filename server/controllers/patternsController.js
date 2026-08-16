const getPatternData = async (req, res) => {
  try {
    const { lat, lon, name } = req.query;

    if (!lat || !lon) {
      return res.status(400).json({ error: 'Latitude and longitude are required' });
    }

    const venueName = name || 'Selected Location';
    console.log(`Fetching patterns for ${venueName} at ${lat}, ${lon}`);

    const patternResult = generateVenuePattern(venueName);
    res.json(patternResult);

  } catch (error) {
    console.error('Error fetching patterns:', error);
    res.status(500).json({ error: 'Failed to fetch pattern data' });
  }
};

// Deterministic string hash algorithm to seed venue patterns
function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

// Generate unique, variable crowd data for different venues and days
function generateVenuePattern(venueName) {
  const seed = hashString(venueName || "Location");
  const currentHour = new Date().getHours();
  const currentDay = new Date().getDay(); // 0 is Sunday, 1 is Monday

  // 7 days of the week: Mon=1, Tue=2, Wed=3, Thu=4, Fri=5, Sat=6, Sun=0
  const days = [
    { day_int: 1, day_text: "Monday", baseFactor: 0.35 + ((seed % 5) * 0.08) },
    { day_int: 2, day_text: "Tuesday", baseFactor: 0.50 + (((seed * 3) % 5) * 0.07) },
    { day_int: 3, day_text: "Wednesday", baseFactor: 0.22 + (((seed * 5) % 4) * 0.06) }, // Lowest day
    { day_int: 4, day_text: "Thursday", baseFactor: 0.55 + (((seed * 7) % 5) * 0.07) },
    { day_int: 5, day_text: "Friday", baseFactor: 0.82 + (((seed * 11) % 4) * 0.05) },
    { day_int: 6, day_text: "Saturday", baseFactor: 0.88 - (((seed * 13) % 4) * 0.05) }, // Peak weekend
    { day_int: 0, day_text: "Sunday", baseFactor: 0.38 + (((seed * 17) % 5) * 0.06) }
  ];

  let lowestDensity = Infinity;
  let bestDayText = "Wednesday";
  let bestHourText = "3:00 PM";

  const analysis = days.map((d) => {
    const day_raw = [];
    for (let h = 0; h < 24; h++) {
      if (h >= 8 && h <= 22) {
        // Curve peaks around 12 PM (lunch) and 6 PM (dinner/shopping)
        const hourSine = Math.sin((h - 8) * Math.PI / 14);
        let busyness = Math.floor((25 + hourSine * 60) * d.baseFactor);
        
        // Add small deterministic noise per hour
        const hourNoise = ((seed * (h + 1) * (d.day_int + 1)) % 13) - 6;
        busyness = Math.max(10, Math.min(98, busyness + hourNoise));

        // Simulate live spike for current day & hour
        if (d.day_int === currentDay && h === currentHour && (seed % 3 === 0)) {
          busyness = Math.min(100, busyness + 25);
        }

        day_raw.push(busyness);

        if (busyness < lowestDensity) {
          lowestDensity = busyness;
          bestDayText = d.day_text;
          const displayH = h % 12 || 12;
          const ampm = h >= 12 ? 'PM' : 'AM';
          bestHourText = `${displayH}:00 ${ampm}`;
        }
      } else {
        day_raw.push(0);
      }
    }
    return { day_info: { day_int: d.day_int, day_text: d.day_text }, day_raw };
  });

  return {
    status: 'OK',
    venue_info: {
      venue_name: venueName,
      venue_address: '88 Grand Avenue',
    },
    analysis: analysis,
    insights: {
      best_time_to_go: {
        day: bestDayText,
        hour: bestHourText,
        reason: `Typically has lowest expected crowd density (~${Math.round(lowestDensity)}% busyness, 0-5 min wait).`
      },
      current_status: {
        hour: currentHour,
        busyness: analysis.find(a => a.day_info.day_int === currentDay)?.day_raw[currentHour] || 45,
        is_live_spike: (seed % 3 === 0)
      }
    }
  };
}

module.exports = {
  getPatternData
};

