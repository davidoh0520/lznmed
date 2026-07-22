(function () {
  'use strict';

  const PUBLIC_RATE_URL = 'https://www.sf-international.com/cms/cms-service/admin/file/get/1050017a9c7a41b2b18991e584d73ee91489624281942986752.pdf?downloadName=2026%20Chinese%20Mainland%20Export%20Rates%20Standard%20Express%20%26%20Global%20Express%20%2B%20%26%20Economy%20Express%20Service';
  const FUEL_RATE_URL = 'https://www.sf-express.com/chn/en/support-more/international_fuel_surcharge_introduction';
  const EIA_SERIES_URL = 'https://www.eia.gov/dnav/pet/hist/eer_epjk_pf4_rgc_dpgW.htm';
  const SERVICE_LABELS = {
    EE: 'Economy Express (EE)',
    SE: 'Standard Express (SE)',
    'GE+': 'Global Express+ (GE+)',
  };

  const destinations = `
AE|United Arab Emirates|8|EE,GE+
AR|Argentina|8|GE+
AT|Austria|7|EE,GE+
AU|Australia|4|EE,SE,GE+
BD|Bangladesh|5|EE
BE|Belgium|7|EE,GE+
BG|Bulgaria|9|EE,GE+
BN|Brunei|5|EE
BO|Bolivia|9|GE+
BR|Brazil|8|GE+
CA|Canada|6|EE,GE+
CD|Congo (DRC)|9|GE+
CH|Switzerland|7|GE+
CL|Chile|8|GE+
CM|Cameroon|9|GE+
CO|Colombia|8|GE+
CZ|Czech Republic|7|EE,GE+
DE|Germany|7|EE,GE+
DK|Denmark|7|EE,GE+
EC|Ecuador|9|GE+
EE|Estonia|9|EE,GE+
EG|Egypt|8|GE+
ES|Spain|7|EE,GE+
FI|Finland|7|EE,GE+
FR|France|7|EE,GE+
GB|United Kingdom|7|EE,GE+
GH|Ghana|9|GE+
GR|Greece|7|EE,GE+
GT|Guatemala|9|GE+
HR|Croatia|9|EE,GE+
HU|Hungary|7|EE,GE+
ID|Indonesia|5|SE
IE|Ireland|7|EE,GE+
IN|India|5|EE,SE,GE+
IT|Italy|7|EE,GE+
JO|Jordan|9|GE+
JP|Japan|3|EE,SE,GE+
KE|Kenya|8|GE+
KH|Cambodia|4|EE
KR|South Korea|1|EE,SE
LT|Lithuania|9|EE,GE+
LU|Luxembourg|7|EE,GE+
LV|Latvia|9|EE,GE+
MA|Morocco|8|GE+
ML|Mali|9|GE+
MM|Myanmar|5|SE
MN|Mongolia|5|SE
MX|Mexico|6|GE+
MY|Malaysia|2|EE,SE
NG|Nigeria|8|GE+
NL|Netherlands|7|EE,GE+
NO|Norway|7|GE+
NP|Nepal|5|EE
NZ|New Zealand|4|EE
OM|Oman|9|GE+
PA|Panama|8|GE+
PE|Peru|8|GE+
PH|Philippines|5|EE
PK|Pakistan|5|EE
PL|Poland|7|EE,GE+
PT|Portugal|7|EE,GE+
QA|Qatar|9|GE+
RO|Romania|9|EE,GE+
SA|Saudi Arabia|8|EE
SE|Sweden|7|EE,GE+
SG|Singapore|2|EE,SE
SI|Slovenia|9|EE,GE+
SK|Slovakia|7|EE,GE+
SR|Suriname|9|GE+
TG|Togo|9|GE+
TH|Thailand|2|EE,SE
TR|Turkey|7|GE+
TZ|Tanzania|9|GE+
UG|Uganda|9|GE+
US|U.S.A.|6|EE,GE+
UY|Uruguay|8|GE+
VE|Venezuela|8|GE+
VN|Vietnam|2|EE,SE
ZA|South Africa|8|GE+
DZ|Algeria|9|GE+
AO|Angola|9|GE+`
    .trim()
    .split('\n')
    .map(row => {
      const [code, name, zone, services] = row.split('|');
      return { code, name, zone: Number(zone), services: services.split(',') };
    });

  const standardRows = parseRateRows(`
0.5|156|178|236|287|274|313|288|406|420|500|608
1.0|189|222|280|342|339|378|344|489|499|621|776
1.5|221|265|323|393|404|445|400|569|576|740|945
2.0|254|309|367|446|469|509|455|651|652|860|1113
2.5|287|352|410|510|534|575|511|732|729|978|1281
3.0|320|393|452|577|599|641|565|815|806|1096|1436
3.5|351|433|489|641|664|708|620|897|882|1208|1590
4.0|383|470|525|707|728|773|675|979|960|1321|1748
4.5|414|510|560|773|793|839|729|1061|1037|1432|1902
5.0|445|547|596|839|858|905|783|1141|1114|1543|2057
5.5|476|585|630|903|923|972|836|1223|1191|1654|2202
6.0|508|621|666|968|988|1038|891|1306|1267|1765|2348
6.5|539|659|701|1033|1053|1106|945|1387|1344|1879|2492
7.0|571|695|735|1097|1118|1172|1000|1470|1421|1990|2638
7.5|602|733|771|1163|1183|1238|1054|1550|1498|2101|2783
8.0|634|769|806|1227|1247|1308|1109|1633|1576|2212|2929
8.5|665|808|840|1292|1312|1375|1163|1713|1652|2324|3074
9.0|698|843|876|1357|1377|1442|1217|1796|1729|2437|3219
9.5|729|882|911|1422|1442|1509|1271|1878|1805|2548|3365
10.0|759|918|944|1486|1507|1574|1325|1960|1883|2659|3511
10.5|791|951|978|1549|1572|1633|1380|2041|1960|2770|3651
11.0|822|986|1012|1611|1637|1693|1436|2123|2036|2881|3793
11.5|854|1020|1046|1673|1701|1751|1492|2204|2114|2993|3934
12.0|885|1054|1079|1734|1767|1807|1547|2287|2190|3104|4075
12.5|917|1089|1113|1797|1832|1865|1603|2368|2267|3216|4216
13.0|948|1122|1148|1859|1897|1925|1658|2450|2345|3327|4359
13.5|980|1156|1181|1921|1962|1983|1714|2531|2421|3439|4499
14.0|1011|1191|1215|1984|2027|2041|1770|2614|2498|3551|4642
14.5|1043|1224|1248|2045|2092|2138|1825|2696|2574|3662|4781
15.0|1073|1259|1282|2107|2157|2196|1880|2777|2652|3773|4923
15.5|1105|1292|1315|2168|2223|2254|1935|2861|2728|3885|5065
16.0|1137|1325|1349|2229|2288|2315|1991|2945|2806|3997|5206
16.5|1169|1357|1383|2293|2354|2371|2047|3031|2883|4109|5346
17.0|1200|1390|1417|2354|2420|2433|2102|3113|2959|4220|5488
17.5|1232|1423|1451|2417|2486|2495|2158|3197|3036|4331|5629
18.0|1263|1456|1484|2479|2552|2563|2213|3281|3112|4443|5770
18.5|1294|1489|1518|2541|2618|2631|2269|3365|3190|4555|5911
19.0|1326|1521|1553|2549|2684|2700|2324|3402|3268|4667|6054
19.5|1357|1546|1586|2555|2750|2768|2379|3443|3333|4740|6194`);

  const standardPerKg = parseBandRows(`
20|44|70|79|80|128|138|142|119|175|169|240|315
45|70|70|79|80|128|138|142|119|175|169|240|315
71|99|69|78|78|126|136|140|116|170|166|239|309
100|299|69|78|78|126|136|140|116|170|166|239|309
300|499|65|74|76|125|134|138|112|168|165|237|303
500|999|65|74|76|125|134|138|112|168|165|237|303
1000|999999|65|74|76|125|134|138|112|168|165|237|303`);

  const economyRows = parseRateRows(`
0.5|130|150|205|232|244|299|309|321|350
1.0|158|180|237|291|293|372|363|410|465
1.5|185|209|270|349|341|433|418|499|579
2.0|213|239|302|408|389|495|471|588|693
2.5|240|269|335|467|436|558|525|678|808
3.0|265|298|364|519|480|620|578|762|918
3.5|291|326|393|573|525|682|633|840|1028
4.0|317|356|422|626|569|744|685|921|1137
4.5|341|384|451|680|614|806|738|1000|1246
5.0|366|413|478|733|657|868|792|1079|1355
5.5|390|442|507|787|701|930|848|1154|1464
6.0|416|471|536|840|745|993|902|1228|1574
6.5|441|498|565|894|789|1057|957|1303|1684
7.0|467|528|595|947|833|1120|1012|1377|1792
7.5|492|556|624|1001|877|1183|1067|1451|1902
8.0|517|585|654|1054|921|1247|1121|1525|2010
8.5|542|613|683|1108|965|1310|1177|1600|2120
9.0|568|643|712|1161|1009|1373|1232|1674|2229
9.5|593|671|742|1215|1053|1436|1286|1749|2338
10.0|618|701|769|1268|1096|1458|1342|1823|2447
10.5|642|727|798|1324|1140|1520|1396|1891|2554
11.0|668|755|827|1379|1184|1581|1451|1962|2661
11.5|692|783|856|1436|1228|1644|1506|2030|2768
12.0|719|810|884|1492|1272|1704|1561|2099|2875
12.5|743|837|914|1547|1318|1765|1615|2168|2982
13.0|769|865|942|1603|1362|1826|1671|2238|3088
13.5|793|892|970|1658|1406|1888|1726|2307|3196
14.0|819|920|999|1714|1450|1950|1779|2376|3302
14.5|844|946|1028|1770|1494|2012|1835|2445|3410
15.0|869|975|1055|1826|1537|2072|1889|2514|3516
15.5|894|1002|1086|1882|1581|2134|1944|2579|3624
16.0|919|1030|1116|1938|1625|2195|1999|2645|3730
16.5|944|1056|1147|1993|1669|2257|2054|2711|3837
17.0|970|1086|1177|2049|1713|2318|2108|2776|3944
17.5|994|1112|1207|2104|1757|2379|2164|2841|4051
18.0|1021|1140|1238|2160|1801|2440|2219|2906|4158
18.5|1045|1168|1268|2217|1845|2502|2273|2971|4265
19.0|1071|1196|1299|2272|1889|2564|2329|3036|4371
19.5|1095|1222|1329|2328|1933|2626|2383|3085|4479`);

  const economyPerKg = parseBandRows(`
20|44|57|63|68|119|100|137|123|155|227
45|70|57|63|68|119|100|137|123|155|227
71|99|56|60|65|116|98|136|121|152|224
100|299|56|60|65|116|98|136|121|152|224
300|499|52|57|63|113|95|134|119|150|221
500|999|52|57|63|113|95|134|119|150|221
1000|999999|52|57|63|113|95|134|119|150|221`);

  const fuelPeriods = [
    ['2026-01-01', '2026-01-31', 20.5, 20.5],
    ['2026-02-01', '2026-02-28', 18.25, 18.25],
    ['2026-03-01', '2026-03-31', 18.75, 18.75],
    ['2026-04-01', '2026-04-05', 39.5, 39.5],
    ['2026-04-06', '2026-04-12', 39.25, 39.25],
    ['2026-04-13', '2026-04-19', 40, 40],
    ['2026-04-20', '2026-04-26', 38.25, 38.25],
    ['2026-04-27', '2026-05-03', 35.5, 35.5],
    ['2026-05-04', '2026-05-10', 38, 38],
    ['2026-05-11', '2026-05-17', 41.25, 41.25],
    ['2026-05-18', '2026-05-24', 39.75, 39.75],
    ['2026-05-25', '2026-05-31', 41, 41],
    ['2026-06-01', '2026-06-01', 40.5, 40.5],
    ['2026-06-02', '2026-06-07', 40.5, 43],
    ['2026-06-08', '2026-06-14', 30.25, 35],
    ['2026-06-15', '2026-06-21', 31.25, 35],
    ['2026-06-22', '2026-06-28', 29, 33.5],
    ['2026-06-29', '2026-07-05', 25.5, 30.5],
    ['2026-07-06', '2026-07-12', 25, 30],
    ['2026-07-13', '2026-07-19', 25.25, 30.25],
    ['2026-07-20', '2026-07-26', 26.5, 31],
  ].map(([start, end, standard, global]) => ({ start, end, standard, global }));

  const fuelBandGroups = [
    { rate: 4, starts: [0.32,0.35,0.38,0.41,0.44,0.47,0.50,0.53,0.56,0.59,0.62,0.65,0.68,0.71,0.74,0.77,0.80,0.83,0.86,0.89,0.92,0.95,0.98,1.01,1.04,1.07,1.10,1.13,1.16,1.19,1.22,1.25,1.28], repeated: 6 },
    { rate: 11, starts: [1.31,1.34,1.37,1.39,1.41,1.44,1.46,1.48,1.50,1.52,1.54,1.56,1.58,1.60,1.62,1.64,1.66,1.68,1.70,1.72,1.74,1.76,1.78,1.80,1.82,1.84,1.87,1.90,1.93,1.96,1.99,2.02,2.05] },
    { rate: 19.25, starts: [2.08,2.11,2.14,2.17,2.20,2.23,2.26,2.29,2.32,2.35,2.38,2.41,2.44,2.47,2.50,2.53,2.56,2.59,2.62,2.65,2.68,2.71,2.74,2.77,2.80,2.83,2.86,2.89,2.92,2.95,2.98,3.01,3.04] },
    { rate: 27.5, starts: Array.from({ length: 33 }, (_, index) => Number((3.06 + index * 0.02).toFixed(2))) },
    { rate: 35.75, starts: Array.from({ length: 33 }, (_, index) => Number((3.72 + index * 0.02).toFixed(2))) },
  ];

  function parseRateRows(value) {
    return value.trim().split('\n').map(row => row.split('|').map(Number));
  }

  function parseBandRows(value) {
    return value.trim().split('\n').map(row => {
      const numbers = row.split('|').map(Number);
      return { min: numbers[0], max: numbers[1], rates: numbers.slice(2) };
    });
  }

  function normalizeCountry(value) {
    return String(value || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  }

  function findDestination(value) {
    const aliases = {
      unitedstates: 'US', unitedstatesofamerica: 'US', america: 'US',
      uae: 'AE', emirates: 'AE', czechia: 'CZ',
      democraticrepublicofthecongo: 'CD', drcongo: 'CD',
      republicofkorea: 'KR', korea: 'KR',
    };
    const raw = normalizeCountry(value);
    const normalized = normalizeCountry(aliases[raw] || raw);
    if (!normalized) return null;
    return destinations.find(item => normalizeCountry(item.code) === normalized || normalizeCountry(item.name) === normalized) ||
      destinations.find(item => normalizeCountry(item.name).includes(normalized) || normalized.includes(normalizeCountry(item.name))) || null;
  }

  function serviceZone(destination, service) {
    if (service === 'GE+' && destination.code === 'JP') return '3+';
    if (service === 'GE+' && destination.code === 'AU') return '4+';
    if (service === 'GE+' && destination.code === 'IN') return 7;
    return destination.zone;
  }

  function standardColumn(zone) {
    return ({ 1: 1, 2: 2, 3: 3, '3+': 4, 4: 5, '4+': 6, 5: 7, 6: 8, 7: 9, 8: 10, 9: 11 })[zone];
  }

  function calculateChargeableWeight(actualKg, cbm) {
    const actual = Number(actualKg || 0);
    const volume = Number(cbm || 0) * 200;
    const raw = Math.max(actual, volume);
    if (!(raw > 0)) throw new Error('Enter actual weight or CBM.');
    const chargeable = raw < 20 ? Math.ceil(raw * 2 - 1e-9) / 2 : Math.ceil(raw - 1e-9);
    return { actual, volume, raw, chargeable };
  }

  function calculateBaseFreight(destinationCode, service, chargeableWeight) {
    const destination = findDestination(destinationCode);
    if (!destination) throw new Error('Select a destination country.');
    if (!destination.services.includes(service)) throw new Error(`${SERVICE_LABELS[service]} is not listed for ${destination.name}.`);
    const zone = serviceZone(destination, service);
    const weight = Number(chargeableWeight);
    if (weight < 20) {
      const rows = service === 'EE' ? economyRows : standardRows;
      const row = rows.find(item => Math.abs(item[0] - weight) < 0.001);
      if (!row) throw new Error('The chargeable weight does not match an SF tariff row.');
      const column = service === 'EE' ? Number(zone) : standardColumn(zone);
      return { amount: row[column], destination, zone, rateType: 'fixed', rate: row[column] };
    }
    const bands = service === 'EE' ? economyPerKg : standardPerKg;
    const band = bands.find(item => weight >= item.min && weight <= item.max);
    if (!band) throw new Error('The chargeable weight is outside the published SF tariff.');
    const column = service === 'EE' ? Number(zone) - 1 : standardColumn(zone) - 1;
    const rate = band.rates[column];
    return { amount: rate * weight, destination, zone, rateType: 'per_kg', rate, band: `${band.min}-${band.max >= 999999 ? '+' : band.max} kg` };
  }

  function knownFuelRate(dateValue, service) {
    const date = String(dateValue || '').slice(0, 10);
    const period = fuelPeriods.find(item => date >= item.start && date <= item.end);
    if (!period) return null;
    return {
      rate: service === 'GE+' ? period.global : period.standard,
      start: period.start,
      end: period.end,
      source: 'SF official published rate',
      verified: true,
    };
  }

  function lookupStandardFuelRate(priceValue) {
    const price = Number(priceValue);
    const bands = [];
    fuelBandGroups.forEach(group => group.starts.forEach((start, index) => {
      const offset = group.repeated ? Math.max(0, index - group.repeated + 1) : index;
      bands.push({ start, rate: group.rate + offset * 0.25 });
    }));
    bands.sort((a, b) => a.start - b.start);
    const match = [...bands].reverse().find(item => price >= item.start - 1e-9);
    if (!match || price >= 4.38) throw new Error('The latest EIA price is outside the published SF fuel table. Enter the official rate manually.');
    return Number(match.rate.toFixed(2));
  }

  function isoDate(date) {
    return date.toISOString().slice(0, 10);
  }

  function targetEiaWeek(dateValue) {
    const date = new Date(`${String(dateValue).slice(0, 10)}T00:00:00Z`);
    if (Number.isNaN(date.getTime())) throw new Error('Select a valid shipment date.');
    const monday = new Date(date);
    monday.setUTCDate(date.getUTCDate() - ((date.getUTCDay() + 6) % 7));
    const target = new Date(monday);
    target.setUTCDate(monday.getUTCDate() - 10);
    return target;
  }

  async function loadFuelRate(dateValue, service, force = false) {
    const known = knownFuelRate(dateValue, service);
    if (known && !force) return known;
    if (service === 'GE+') {
      throw new Error('GE+ uses a separately published China rate. Open the SF official rate page and enter the current percentage.');
    }
    const target = targetEiaWeek(dateValue);
    const cacheKey = `lzn_sf_eia_${isoDate(target)}`;
    if (!force) {
      try {
        const cached = JSON.parse(localStorage.getItem(cacheKey) || 'null');
        if (cached && Date.now() - cached.savedAt < 12 * 60 * 60 * 1000) return cached.value;
      } catch (_) {}
    }
    const start = new Date(target);
    start.setUTCDate(target.getUTCDate() - 35);
    const params = new URLSearchParams({
      api_key: 'DEMO_KEY', frequency: 'weekly', 'data[0]': 'value',
      'facets[series][]': 'EER_EPJK_PF4_RGC_DPG', 'sort[0][column]': 'period',
      'sort[0][direction]': 'desc', start: isoDate(start), end: isoDate(target), length: '8',
    });
    const response = await fetch(`https://api.eia.gov/v2/petroleum/pri/spt/data/?${params}`);
    if (!response.ok) throw new Error('EIA fuel data could not be loaded. Enter the SF official rate manually.');
    const payload = await response.json();
    const rows = payload?.response?.data || [];
    const row = rows.find(item => item.period <= isoDate(target) && Number(item.value) > 0);
    if (!row) throw new Error('The EIA reference week is not published yet. Enter the SF official rate manually.');
    const value = {
      rate: lookupStandardFuelRate(row.value),
      start: isoDate(new Date(`${String(dateValue).slice(0, 10)}T00:00:00Z`)),
      end: '',
      source: `EIA USGC ${row.period}: USD ${Number(row.value).toFixed(3)}/gal, SF published scale`,
      verified: false,
      eiaPeriod: row.period,
      eiaPrice: Number(row.value),
    };
    try { localStorage.setItem(cacheKey, JSON.stringify({ savedAt: Date.now(), value })); } catch (_) {}
    return value;
  }

  window.LZN_SF_FREIGHT = {
    destinations,
    serviceLabels: SERVICE_LABELS,
    publicRateUrl: PUBLIC_RATE_URL,
    fuelRateUrl: FUEL_RATE_URL,
    eiaSeriesUrl: EIA_SERIES_URL,
    tariffEffective: { SE: '2026-01-03', 'GE+': '2026-01-03', EE: '2026-01-20' },
    findDestination,
    calculateChargeableWeight,
    calculateBaseFreight,
    knownFuelRate,
    lookupStandardFuelRate,
    loadFuelRate,
  };
})();
