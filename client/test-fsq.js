const fetch = require('node-fetch'); // wait, native fetch is in Node 18+

async function testFsq() {
  const apiKey = "DEXQHXOQIB1G3T4WFHOGFFGIT5THMEK0B2XRYFJQ5YVBEVYE";
  const url = `https://api.foursquare.com/v3/places/search?ll=40.7580,-73.9855&limit=2`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: apiKey,
      },
    });

    if (!response.ok) {
      console.log("Failed:", response.status, response.statusText);
      const text = await response.text();
      console.log(text);
    } else {
      const data = await response.json();
      console.log("Success! Found places:", data.results.length);
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

testFsq();
