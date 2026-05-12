export async function fetchTemperature(lat, lng) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${encodeURIComponent(lat)}&longitude=${encodeURIComponent(lng)}&current_weather=true&temperature_unit=celsius`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error('Weather service unavailable');
  }

  const data = await response.json();
  if (!data.current_weather) {
    throw new Error('Weather data missing');
  }

  return data.current_weather.temperature;
}
