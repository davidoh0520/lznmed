(() => {
  'use strict';

  const CACHE_PREFIX = 'lzn-address-profile-v1:';
  const DEFAULT_CONFIG = {
    countryCodesUrl: 'https://countriesnow.space/api/v0.1/countries/codes',
    statesUrl: 'https://countriesnow.space/api/v0.1/countries/states',
    citiesUrl: 'https://countriesnow.space/api/v0.1/countries/state/cities',
    geocoderUrl: 'https://nominatim.openstreetmap.org/search',
    geocoderEmail: 'sales@lznmed.com',
    referenceCacheMs: 7 * 24 * 60 * 60 * 1000,
    postalCacheMs: 30 * 24 * 60 * 60 * 1000
  };
  const COUNTRY_ALIASES = {
    'korea republic of': 'south korea',
    'republic of korea': 'south korea',
    'korea south': 'south korea',
    'united states of america': 'united states',
    'u s a': 'united states',
    'usa': 'united states',
    'u k': 'united kingdom',
    'uk': 'united kingdom',
    'viet nam': 'vietnam'
  };

  let countryRecordsPromise;
  let lastGeocoderRequestAt = 0;
  let geocoderQueue = Promise.resolve();

  function config() {
    return { ...DEFAULT_CONFIG, ...(window.LZN_ADDRESS_PROFILE_CONFIG || {}) };
  }

  function normalize(value) {
    return String(value || '')
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, ' ')
      .trim();
  }

  function cacheRead(key) {
    try {
      const saved = JSON.parse(localStorage.getItem(`${CACHE_PREFIX}${key}`) || 'null');
      if (!saved || saved.expiresAt <= Date.now()) return null;
      return saved.value;
    } catch (_) {
      return null;
    }
  }

  function cacheWrite(key, value, maxAge) {
    try {
      localStorage.setItem(`${CACHE_PREFIX}${key}`, JSON.stringify({
        expiresAt: Date.now() + maxAge,
        value
      }));
    } catch (_) {
      // Address assistance remains usable without browser storage.
    }
  }

  async function requestJson(url, options = {}) {
    const response = await fetch(url, {
      credentials: 'omit',
      ...options,
      headers: {
        Accept: 'application/json',
        ...(options.headers || {})
      }
    });
    if (!response.ok) throw new Error(`Address service returned ${response.status}`);
    return response.json();
  }

  function uniqueSorted(values) {
    return [...new Set(values.filter(Boolean))].sort((a, b) => a.localeCompare(b));
  }

  function fillDatalist(list, values) {
    if (!list) return;
    list.replaceChildren(...uniqueSorted(values).map(value => {
      const option = document.createElement('option');
      option.value = value;
      return option;
    }));
  }

  async function loadCountryRecords(currentConfig) {
    const cached = cacheRead('country-codes');
    if (cached) return cached;
    const result = await requestJson(currentConfig.countryCodesUrl);
    const records = (Array.isArray(result?.data) ? result.data : [])
      .map(item => ({
        name: String(item?.name || '').trim(),
        code: String(item?.code || '').trim().toUpperCase(),
        dialCode: String(item?.dial_code || '').trim()
      }))
      .filter(item => item.name && item.code);
    cacheWrite('country-codes', records, currentConfig.referenceCacheMs);
    return records;
  }

  function countries(currentConfig) {
    if (!countryRecordsPromise) {
      countryRecordsPromise = loadCountryRecords(currentConfig).catch(error => {
        countryRecordsPromise = null;
        throw error;
      });
    }
    return countryRecordsPromise;
  }

  function findCountry(records, value) {
    const normalized = normalize(value);
    const target = COUNTRY_ALIASES[normalized] || normalized;
    return records.find(record => normalize(record.name) === target)
      || records.find(record => normalize(record.code) === target);
  }

  async function loadStates(currentConfig, country) {
    const key = `states:${country.code}`;
    const cached = cacheRead(key);
    if (cached) return cached;
    const result = await requestJson(currentConfig.statesUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ country: country.name })
    });
    const source = Array.isArray(result?.data?.states)
      ? result.data.states
      : (Array.isArray(result?.data) ? result.data : []);
    const states = source.map(item => String(item?.name || item || '').trim()).filter(Boolean);
    cacheWrite(key, states, currentConfig.referenceCacheMs);
    return states;
  }

  async function loadCities(currentConfig, country, state) {
    const key = `cities:${country.code}:${normalize(state)}`;
    const cached = cacheRead(key);
    if (cached) return cached;
    const result = await requestJson(currentConfig.citiesUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ country: country.name, state })
    });
    const cities = (Array.isArray(result?.data) ? result.data : [])
      .map(value => String(value || '').trim())
      .filter(Boolean);
    cacheWrite(key, cities, currentConfig.referenceCacheMs);
    return cities;
  }

  function updateDialValue(input, nextDialCode, previousDialCode, fillWhenEmpty) {
    if (!input) return;
    const current = input.value.trim();
    input.placeholder = nextDialCode ? `${nextDialCode} phone number` : 'International phone number';
    if (!nextDialCode) return;
    if (!current) {
      if (fillWhenEmpty) input.value = `${nextDialCode} `;
      return;
    }
    if (previousDialCode && current.startsWith(previousDialCode) && previousDialCode !== nextDialCode) {
      input.value = `${nextDialCode}${current.slice(previousDialCode.length)}`;
      return;
    }
    if (!current.startsWith('+')) input.value = `${nextDialCode} ${current}`;
  }

  function wait(milliseconds) {
    return new Promise(resolve => setTimeout(resolve, milliseconds));
  }

  function queuedGeocoderRequest(url) {
    const run = async () => {
      const remaining = 1100 - (Date.now() - lastGeocoderRequestAt);
      if (remaining > 0) await wait(remaining);
      lastGeocoderRequestAt = Date.now();
      return requestJson(url);
    };
    const result = geocoderQueue.then(run, run);
    geocoderQueue = result.catch(() => {});
    return result;
  }

  async function findPostalCode(currentConfig, address, country) {
    const key = `postal:${normalize([
      address.street,
      address.city,
      address.state,
      address.country
    ].join('|'))}`;
    const cached = cacheRead(key);
    if (cached !== null) return cached;

    const params = new URLSearchParams({
      format: 'jsonv2',
      addressdetails: '1',
      limit: '1',
      street: address.street,
      city: address.city,
      country: address.country
    });
    if (address.state) params.set('state', address.state);
    if (country?.code) params.set('countrycodes', country.code.toLowerCase());
    if (currentConfig.geocoderEmail) params.set('email', currentConfig.geocoderEmail);

    const separator = currentConfig.geocoderUrl.includes('?') ? '&' : '?';
    const results = await queuedGeocoderRequest(`${currentConfig.geocoderUrl}${separator}${params}`);
    const postcode = String(results?.[0]?.address?.postcode || '').trim();
    cacheWrite(key, postcode, currentConfig.postalCacheMs);
    return postcode;
  }

  function enhance(form) {
    if (!form) return;
    const currentConfig = config();
    const countryInput = form.elements.country;
    const stateInput = form.elements.state_province;
    const cityInput = form.elements.city;
    const streetInput = form.elements.address_line_1;
    const postalInput = form.elements.postal_code;
    const phoneInput = form.elements.phone;
    const whatsappInput = form.elements.whatsapp;
    const countryList = form.querySelector('#profileCountryOptions');
    const stateList = form.querySelector('#profileStateOptions');
    const cityList = form.querySelector('#profileCityOptions');
    const countryStatus = form.querySelector('[data-country-status]');
    const postalStatus = form.querySelector('[data-postal-status]');

    if (!countryInput || !stateInput || !cityInput || !streetInput || !postalInput) return;

    let records = [];
    let selectedCountry = null;
    let previousDialCode = '';
    let countryTimer;
    let countryRequest = 0;
    let cityRequest = 0;
    let postalRequest = 0;
    let lastPostalAddress = '';

    const setCountryStatus = message => {
      if (countryStatus) countryStatus.textContent = message;
    };
    const setPostalStatus = message => {
      if (postalStatus) postalStatus.textContent = message;
    };

    const applyCountry = async ({ clearDependents = false } = {}) => {
      const country = findCountry(records, countryInput.value);
      if (!country) {
        countryRequest += 1;
        cityRequest += 1;
        fillDatalist(stateList, []);
        fillDatalist(cityList, []);
        setCountryStatus('Choose a country from the suggestions, or type it manually.');
        return;
      }

      const countryChanged = selectedCountry?.code && selectedCountry.code !== country.code;
      selectedCountry = country;
      countryInput.value = country.name;
      updateDialValue(phoneInput, country.dialCode, previousDialCode, true);
      updateDialValue(whatsappInput, country.dialCode, previousDialCode, false);
      previousDialCode = country.dialCode;
      setCountryStatus(country.dialCode
        ? `Country calling code ${country.dialCode} is ready. Loading states / provinces…`
        : 'Loading states / provinces…');

      if (clearDependents && countryChanged) {
        stateInput.value = '';
        cityInput.value = '';
        postalInput.value = '';
        fillDatalist(stateList, []);
        fillDatalist(cityList, []);
      }

      const requestId = ++countryRequest;
      try {
        const states = await loadStates(currentConfig, country);
        if (requestId !== countryRequest || !document.body.contains(form)) return;
        fillDatalist(stateList, states);
        setCountryStatus(states.length
          ? `${country.dialCode ? `Calling code ${country.dialCode}. ` : ''}Choose a state / province from the suggestions.`
          : `${country.dialCode ? `Calling code ${country.dialCode}. ` : ''}Type the state / province manually.`);
        if (stateInput.value.trim()) await applyState();
      } catch (_) {
        if (requestId !== countryRequest) return;
        fillDatalist(stateList, []);
        setCountryStatus(`${country.dialCode ? `Calling code ${country.dialCode}. ` : ''}Region suggestions are unavailable; type the value manually.`);
      }
    };

    const applyState = async ({ clearCity = false } = {}) => {
      const state = stateInput.value.trim();
      if (!selectedCountry || !state) {
        fillDatalist(cityList, []);
        return;
      }
      if (clearCity) {
        cityInput.value = '';
        postalInput.value = '';
      }
      const requestId = ++cityRequest;
      setCountryStatus('Loading cities…');
      try {
        const cities = await loadCities(currentConfig, selectedCountry, state);
        if (requestId !== cityRequest || !document.body.contains(form)) return;
        fillDatalist(cityList, cities);
        setCountryStatus(cities.length
          ? 'Choose a city from the suggestions, then enter the detailed street address.'
          : 'City suggestions are unavailable; type the city manually.');
      } catch (_) {
        if (requestId !== cityRequest) return;
        fillDatalist(cityList, []);
        setCountryStatus('City suggestions are unavailable; type the city manually.');
      }
    };

    const lookupPostalCode = async () => {
      const address = {
        street: streetInput.value.trim(),
        city: cityInput.value.trim(),
        state: stateInput.value.trim(),
        country: countryInput.value.trim()
      };
      if (!address.street || !address.city || !address.country) {
        setPostalStatus('Complete the country, city and detailed street address to find the postal code.');
        return;
      }
      const addressKey = normalize(Object.values(address).join('|'));
      if (addressKey === lastPostalAddress) return;
      lastPostalAddress = addressKey;
      const requestId = ++postalRequest;
      setPostalStatus('Finding the postal code from the completed address…');
      try {
        const postcode = await findPostalCode(currentConfig, address, selectedCountry);
        if (requestId !== postalRequest || !document.body.contains(form)) return;
        if (postcode) {
          postalInput.value = postcode;
          setPostalStatus(`Postal code ${postcode} was filled automatically. You can correct it if needed.`);
        } else {
          setPostalStatus('No postal code was found. Please enter it manually.');
        }
      } catch (_) {
        if (requestId !== postalRequest) return;
        setPostalStatus('Postal-code lookup is temporarily unavailable. Please enter it manually.');
      }
    };

    countryInput.addEventListener('input', () => {
      clearTimeout(countryTimer);
      countryTimer = setTimeout(() => applyCountry({ clearDependents: true }), 180);
    });
    const applyCountryNow = () => {
      clearTimeout(countryTimer);
      applyCountry({ clearDependents: true });
    };
    countryInput.addEventListener('change', applyCountryNow);
    countryInput.addEventListener('blur', applyCountryNow);
    stateInput.addEventListener('change', () => applyState({ clearCity: true }));
    stateInput.addEventListener('blur', () => applyState());
    cityInput.addEventListener('change', () => {
      postalInput.value = '';
      lookupPostalCode();
    });
    streetInput.addEventListener('input', () => {
      lastPostalAddress = '';
      setPostalStatus('The postal code will be refreshed after you finish the detailed address.');
    });
    streetInput.addEventListener('blur', lookupPostalCode);

    setCountryStatus('Loading countries and calling codes…');
    countries(currentConfig)
      .then(loadedRecords => {
        if (!document.body.contains(form)) return;
        records = loadedRecords;
        fillDatalist(countryList, records.map(record => record.name));
        if (countryInput.value.trim()) applyCountry();
        else setCountryStatus('Choose a country to load its calling code and regions.');
      })
      .catch(() => {
        setCountryStatus('Country suggestions are unavailable; type the country and address manually.');
      });
  }

  window.LZNAddressProfile = { enhance };
})();
