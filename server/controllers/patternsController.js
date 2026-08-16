const getPatternData = async (req, res) => {
  try {
    const { lat, lon, name } = req.query;

    if (!lat || !lon) {
      return res.status(400).json({ error: 'Latitude and longitude are required' });
    }

    // TODO: Connect to BestTime.app API here when ready.
    // Replace the simulated data below with:
    // const response = await fetch(`https://besttime.app/api/v1/forecasts?api_key_private=YOUR_KEY&venue_name=${name}&venue_lat=${lat}&venue_lng=${lon}`);
    // const data = await response.json();
    
    console.log(`Fetching patterns for ${name || 'Unknown Location'} at ${lat}, ${lon}`);

    // Simulated BestTime.app style response
    const currentHour = new Date().getHours();
    const currentDay = new Date().getDay(); // 0 is Sunday, 1 is Monday
    
    // Generate simulated data (0-100% busyness for each day, hour by hour)
    const analysis = [
      { day_info: { day_int: 1, day_text: "Monday" }, day_raw: generateDayRaw(currentDay === 1, currentHour) },
      { day_info: { day_int: 2, day_text: "Tuesday" }, day_raw: generateDayRaw(currentDay === 2, currentHour) },
      { day_info: { day_int: 3, day_text: "Wednesday" }, day_raw: generateDayRaw(currentDay === 3, currentHour) },
      { day_info: { day_int: 4, day_text: "Thursday" }, day_raw: generateDayRaw(currentDay === 4, currentHour) },
      { day_info: { day_int: 5, day_text: "Friday" }, day_raw: generateDayRaw(currentDay === 5, currentHour) },
      { day_info: { day_int: 6, day_text: "Saturday" }, day_raw: generateDayRaw(currentDay === 6, currentHour) },
      { day_info: { day_int: 0, day_text: "Sunday" }, day_raw: generateDayRaw(currentDay === 0, currentHour) }
    ];

    res.json({
      status: 'OK',
      venue_info: {
        venue_name: name || 'Selected Location',
        venue_address: '123 Simulated St',
      },
      analysis: analysis,
      // Provide a summary specifically for the client UI
      insights: {
        best_time_to_go: {
          day: 'Wednesday',
          hour: '2:00 PM',
          reason: 'Typically has 0-5 minute wait times and the store is well-stocked.'
        },
        current_status: {
          hour: currentHour,
          busyness: analysis.find(a => a.day_info.day_int === currentDay).day_raw[currentHour],
          is_live_spike: Math.random() > 0.7 // randomly simulate a spike
        }
      }
    });

  } catch (error) {
    console.error('Error fetching patterns:', error);
    res.status(500).json({ error: 'Failed to fetch pattern data' });
  }
};

// Helper function to generate 24 hours of data
function generateDayRaw(isToday, currentHour) {
  const hours = [];
  for (let i = 0; i < 24; i++) {
    // Normal store hours roughly 8am to 10pm
    if (i >= 8 && i <= 22) {
       // base curve (busier around 12 and 18)
       const base = 40 + Math.sin((i - 8) * Math.PI / 14) * 40; 
       let busyness = Math.floor(base + (Math.random() * 20 - 10));
       
       // Simulate a live spike if it's the current hour
       if (isToday && i === currentHour && Math.random() > 0.7) {
         busyness = Math.min(100, busyness + 30);
       }
       hours.push(Math.max(0, Math.min(100, busyness)));
    } else {
       hours.push(0); // closed
    }
  }
  return hours;
}

module.exports = {
  getPatternData
};
