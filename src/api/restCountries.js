const BASE_URL = 'https://restcountries.com/v3.1';
const fields = 'name,flags,population,capital,region,latlng';

export async function fetchCountries(query, region) {
  let url;

  if (query.trim() && region) {
    url = `${BASE_URL}/name/${encodeURIComponent(query.trim())}?fields=${fields}`;
  } else if (query.trim()) {
    url = `${BASE_URL}/name/${encodeURIComponent(query.trim())}?fields=${fields}`;
  } else if (region) {
    url = `${BASE_URL}/region/${encodeURIComponent(region)}?fields=${fields}`;
  } else {
    url = `${BASE_URL}/all?fields=${fields}`;
  }

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Unable to fetch countries. Please check the search term.');
  }

  const data = await response.json();

  if (query.trim() && region) {
    return data.filter((country) => country.region === region);
  }

  return data;
}
