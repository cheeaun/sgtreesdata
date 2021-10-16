const fs = require('fs');
const polyline = require('@mapbox/polyline');
const msgpack = require('@ygoe/msgpack');
const brotliSize = require('brotli-size');
const prettyBytes = require('pretty-bytes');
const { generate } = require('lil-csv');

console.time('Minifying');
const data = JSON.parse(fs.readFileSync('data/trees-everything.geojson'));

const heritageTrees = [];
data.features.forEach((feature) => {
  const {
    properties: { id, heritage },
  } = feature;
  if (heritage) {
    heritageTrees.push(id);
  }
  // Don't need flowering and heritage to be in the data
  delete feature.properties.flowering;
  delete feature.properties.heritage;
});

const props = data.features.map((f) =>
  Object.values(f.properties).map((v) => (v === null ? '' : v)),
);

const points = data.features.map((f) => f.geometry.coordinates);
const line = polyline.encode(points);

const finalData = { props, line };
console.timeEnd('Minifying');
console.log('---');

const filePath = `data/trees.min.json`;
const jsonData = JSON.stringify(finalData);
fs.writeFileSync(filePath, jsonData);
console.log(`JSON file written: ${filePath}`);
const fileSize = Buffer.byteLength(jsonData, 'utf8');
const fileBrotliSize = brotliSize.sync(jsonData);
console.log(
  `File sizes: ${prettyBytes(fileSize)} (Brotli: ${prettyBytes(
    fileBrotliSize,
  )})`,
);

console.log('---');

const mpData = msgpack.serialize(finalData);
const mpFilePath = 'data/trees.min.mp.ico';
fs.writeFileSync(mpFilePath, mpData);
console.log(`MessagePack file written: ${mpFilePath}`);
const mpFileSize = Buffer.byteLength(mpData, 'utf8');
const mpFileBrotliSize = brotliSize.sync(mpData);
console.log(
  `File sizes: ${prettyBytes(mpFileSize)} (Brotli: ${prettyBytes(
    mpFileBrotliSize,
  )})`,
);

console.log('---');

const csvData = data.features.map((f) => {
  const { properties, geometry } = f;
  return {
    ...properties,
    lng: geometry.coordinates[0],
    lat: geometry.coordinates[1],
  };
});
const csvText = generate(csvData);
const csvFilePath = 'data/trees.csv';
fs.writeFileSync(csvFilePath, csvText);
console.log(`CSV file written: ${csvFilePath}`);
const csvFileSize = Buffer.byteLength(csvText, 'utf8');
const csvFileBrotliSize = brotliSize.sync(csvText);
console.log(
  `File sizes: ${prettyBytes(csvFileSize)} (Brotli: ${prettyBytes(
    csvFileBrotliSize,
  )})`,
);

console.log('---');

const lineFilePath = 'data/trees.line.txt';
fs.writeFileSync(lineFilePath, line);
console.log(`Line file written: ${lineFilePath}`);
const lineFileSize = Buffer.byteLength(line, 'utf8');
const lineFileBrotliSize = brotliSize.sync(line);
console.log(
  `File sizes: ${prettyBytes(lineFileSize)} (Brotli: ${prettyBytes(
    lineFileBrotliSize,
  )})`,
);

console.log('---');

const csvNoCoordsData = data.features.map((f) => f.properties);
const csvNoCoordsText = generate(csvNoCoordsData);
const csvNoCoordsFilePath = 'data/trees-no-coords.csv';
fs.writeFileSync(csvNoCoordsFilePath, csvNoCoordsText);
console.log(`CSV (no coords) file written: ${csvNoCoordsFilePath}`);
const csvNoCoordsFileSize = Buffer.byteLength(csvNoCoordsText, 'utf8');
const csvNoCoordsFileBrotliSize = brotliSize.sync(csvNoCoordsText);
console.log(
  `File sizes: ${prettyBytes(csvNoCoordsFileSize)} (Brotli: ${prettyBytes(
    csvNoCoordsFileBrotliSize,
  )})`,
);

console.log('---');

const heritageTreesFilePath = 'data/heritage-trees.json';
const heritageTreesData = JSON.stringify(heritageTrees);
fs.writeFileSync(heritageTreesFilePath, heritageTreesData);
console.log(`Heritage trees JSON file written: ${heritageTreesFilePath}`);
const heritageTreesFileSize = Buffer.byteLength(heritageTreesData, 'utf8');
const heritageTreesFileBrotliSize = brotliSize.sync(heritageTreesData);
console.log(
  `File sizes: ${prettyBytes(heritageTreesFileSize)} (Brotli: ${prettyBytes(
    heritageTreesFileBrotliSize,
  )})`,
);
