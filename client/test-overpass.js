const lat = 29.6857;
const lon = 76.9905;
const radius = 2000;

const query = `
  [out:json];
  (
    nwr["amenity"="restaurant"](around:${radius},${lat},${lon});
    nwr["amenity"="cafe"](around:${radius},${lat},${lon});
    nwr["amenity"="hospital"](around:${radius},${lat},${lon});
    nwr["amenity"="bank"](around:${radius},${lat},${lon});
  );
  out center;
`;

const url = `https://overpass-api.de/api/interpreter`;

async function testOverpass() {
  const getUrl = url + "?data=" + encodeURIComponent(query);
  const response = await fetch(getUrl, {
    method: "GET"
  });
  
  const text = await response.text();
  console.log("Response text:", text);
}

testOverpass();
