import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { fetchCountries } from './api/restCountries';
import { fetchTemperature } from './api/weather';
import worldMap from './assets/world-map.svg';
import globeIcon from './assets/globe-icon.svg';
import flagIcon from './assets/flag-icon.svg';

const searchSchema = z.object({
  query: z.string().min(2, 'Enter at least 2 characters'),
  region: z.enum(['', 'Africa', 'Americas', 'Asia', 'Europe', 'Oceania']),
});

const regions = ['', 'Africa', 'Americas', 'Asia', 'Europe', 'Oceania'];

function getHemisphere(lat, lng) {
  const vertical = lat >= 0 ? 'Northern Hemisphere' : 'Southern Hemisphere';
  const horizontal = lng >= 0 ? 'Eastern Hemisphere' : 'Western Hemisphere';
  return `${vertical}, ${horizontal}`;
}

function App() {
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(searchSchema),
    defaultValues: { query: '', region: '' },
  });

  async function onSubmit(values) {
    setError(null);
    setLoading(true);

    try {
      const result = await fetchCountries(values.query, values.region);
      const enriched = await Promise.all(
        result.map(async (country) => {
          const [lat, lng] = country.latlng || [0, 0];
          let temperature;

          try {
            temperature = await fetchTemperature(lat, lng);
          } catch {
            temperature = undefined;
          }

          return { ...country, temperature };
        }),
      );

      setCountries(enriched);
    } catch (fetchError) {
      setCountries([]);
      setError(fetchError instanceof Error ? fetchError.message : 'Failed to load countries.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="app-shell">
      <section className="panel">
        <section className="hero">
          <div className="hero-copy">
            <div className="hero-tag">
              <img src={globeIcon} alt="Globe icon" />
              <span>Find countries by name, region, and current temperature.</span>
            </div>
            <h1>Country Explorer</h1>
            <p>
              Use the world map homepage to navigate the globe and discover country details, including whether they are located in the north/south or east/west hemisphere.
            </p>
            <div className="hero-features">
              <div className="feature-card">
                <img src={flagIcon} alt="Flag icon" />
                <div>
                  <strong>Flag preview</strong>
                  <p>Quickly recognize countries by their national flags.</p>
                </div>
              </div>
              <div className="feature-card">
                <img src={globeIcon} alt="Globe icon" />
                <div>
                  <strong>Location insight</strong>
                  <p>See hemisphere data and live temperature values.</p>
                </div>
              </div>
            </div>
          </div>
          <div className="hero-media">
            <img src={worldMap} alt="World map illustration" />
          </div>
        </section>

        <form onSubmit={handleSubmit(onSubmit)} className="search-form" noValidate>
          <label>
            Country name
            <input placeholder="e.g. Brazil" {...register('query')} />
            {errors.query && <span className="input-error">{errors.query.message}</span>}
          </label>

          <label>
            Region
            <select {...register('region')}>
              {regions.map((regionValue) => (
                <option key={regionValue} value={regionValue}>
                  {regionValue || 'All regions'}
                </option>
              ))}
            </select>
          </label>

          <div className="actions">
            <button type="submit" disabled={loading}>
              {loading ? 'Searching…' : 'Search'}
            </button>
            <button
              type="button"
              className="secondary"
              onClick={() => {
                reset();
                setCountries([]);
                setError(null);
              }}
            >
              Reset
            </button>
          </div>
        </form>

        {error && <div className="notice error">{error}</div>}

        <section className="results">
          {loading && <div className="notice">Loading countries...</div>}
          {!loading && countries.length === 0 && !error && (
            <div className="notice">Search for a country to display results.</div>
          )}
          <div className="country-grid">
            {countries.map((country) => {
              const [lat, lng] = country.latlng || [0, 0];

              return (
                <article key={country.name.common} className="country-card">
                  <div className="flag-wrapper">
                    <img src={country.flags.svg} alt={country.flags.alt ?? `${country.name.common} flag`} />
                  </div>
                  <h2>{country.name.common}</h2>
                  <dl>
                    <div>
                      <dt>Capital</dt>
                      <dd>{country.capital?.join(', ') || 'N/A'}</dd>
                    </div>
                    <div>
                      <dt>Population</dt>
                      <dd>{country.population.toLocaleString()}</dd>
                    </div>
                    <div>
                      <dt>Coordinates</dt>
                      <dd>{`${lat.toFixed(2)}°, ${lng.toFixed(2)}°`}</dd>
                    </div>
                    <div>
                      <dt>Hemisphere</dt>
                      <dd>{getHemisphere(lat, lng)}</dd>
                    </div>
                    <div>
                      <dt>Temperature</dt>
                      <dd>{country.temperature !== undefined ? `${country.temperature.toFixed(1)}°C` : 'Unavailable'}</dd>
                    </div>
                  </dl>
                </article>
              );
            })}
          </div>
        </section>
      </section>
    </main>
  );
}

export default App;
