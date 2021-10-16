import fs from 'fs';
import * as turf from '@turf/turf';
import got from 'got';
import terminalLink from 'terminal-link';

const args = process.argv;
const force = args.includes('-f');
const offset = args.includes('--offset')
  ? args[args.indexOf('--offset') + 1]
  : 0;

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const bbox = [103.601, 1.232, 104.1, 1.475];
const squareGrid = turf.squareGrid(bbox, 1.4); // km
console.log('Grid squares count:', squareGrid.features.length);
squareGrid.features.forEach((f, i) => (f.properties.index = i));
fs.writeFileSync('data/grid.json', JSON.stringify(squareGrid, null, '\t'));

const bboxes = squareGrid.features.map((feature) => {
  const [a, b, c, d] = feature.geometry.coordinates[0];
  return [...a, ...c];
});

(async () => {
  let start = parseInt(offset, 10) || 0;
  for (let i = start, l = bboxes.length; i < l; i++) {
    const fileName = `data/grid/grid-${i}.json`;
    if (!force) {
      try {
        const exists = fs.statSync(fileName);
        if (exists) continue;
      } catch (e) {}
    }

    const box = bboxes[i];
    const geometry = {
      xmin: box[0],
      ymin: box[1],
      xmax: box[2],
      ymax: box[3],
      spatialReference: {
        wkid: 4326,
      },
    };
    const url =
      'https://imaven.nparks.gov.sg/arcgis/rest/services/maven/Hashing_UAT/FeatureServer/0/query';
    const query = {
      returnGeometry: true,
      where: '1=1',
      outSr: 4326,
      outFields: '*',
      inSr: 4326,
      geometry: JSON.stringify(geometry),
      // geometry: '{"xmin":103.8262939453125,"ymin":1.3408962578522488,"xmax":103.82698059082031,"ymax":1.3415827152334823,"spatialReference":{"wkid":4326}}',
      geometryType: 'esriGeometryEnvelope',
      spatialRel: 'esriSpatialRelIntersects',
      geometryPrecision: 6,
      f: 'geojson',
    };
    const fullURL = `${url}?${new URLSearchParams(query).toString()}`;
    const link = terminalLink(box.toString(), fullURL);
    console.log(`↗️  ${i}: ${link}`);

    let body;
    try {
      const res = await got(url, {
        responseType: 'json',
        searchParams: query,
      });
      body = res.body;
      if (body.exceededTransferLimit) {
        console.error('Error exceededTransferLimit', body.features.length);
        return;
      }
    } catch (e) {
      console.error(e);
      return;
    }

    const featuresLength = body.features.length;
    console.log(`Box ${i + 1}/${l}:`, featuresLength);
    if (featuresLength) {
      fs.writeFileSync(fileName, JSON.stringify(body, null, '\t'));
      console.log(`Generated ${fileName}`);
    }

    await delay(300);
  }
})();
