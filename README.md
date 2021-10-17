SG Trees Data
===

> Singapore Trees data

This is a data-only repository to complement [ExploreTrees.SG](https://exploretrees.sg).

The data
---

It's in the `data/` folder.

Data pipeline
---

### Requirements

- [Node.js 16](https://nodejs.org/)
- [Tippiecanoe](https://github.com/mapbox/tippecanoe)

### Collection

- `npm run trees` - fetch all raw tree data from [Trees.SG](http://trees.sg) and generate `grid-*.json` files in the `data/grid` folder.
- `npm run family` - fetch family categories for the trees, and generate `species-info.json`, `families-species.json` and `families.json`.
- `npm run pois` - fetch Points of Interets, mainly the parks, community gardens, heritage roads and skyrise greeneries.
  

### Preparation

- `npm run chunk` - read all the raw data and generate a cleaner `trees-everything.geojson` (NOT included in this repository).
- `npm run minify` - generate minified/compressed data (excludes `flowering` and `heritage` data) from `trees-everything.geojson` into:
  -  `trees.min.json`
     - Data with two keys; `line` and `props`.
     - `line` = All tree coordinates combined into a single line encoded with the [Encoded Polyline Algorithm Format](https://developers.google.com/maps/documentation/utilities/polylinealgorithm).
     - `props` = All other values from GeoJSON `feature.properties`
  -  `trees.min.mp.ico`  (NOT included in this repository)
     - Same as `trees.min.json` but compressed with [MessagePack](https://msgpack.org/).
     - `.ico` file extension is used to mask the `.mp` extension which is actually a [MessagePack](https://msgpack.org/) file. It's NOT an icon file and the `.ico` file extension is meant to fool the server to apply Gzip/Brotli compression on it, since there's no official MIME type for MessagePack. GitHub Pages serves `.mp` as uncompressed `application/octet-stream`. Cloudflare [compresses](https://support.cloudflare.com/hc/en-us/articles/200168396-What-will-Cloudflare-compress-) `image/x-icon`.
  -  `trees.csv` - same as `trees-everything.geojson` but in CSV format. Includes raw coordinates.
  -  `trees.line.txt` - same as `line` from `trees.min.json` but in plain text.
  -  `trees-no-coords.csv` - same as `trees.csv` but without coordinates.
  -  `heritage-trees.json` - list of tree IDs that are in the Heritage Trees list.
- `npm run tiles`
  - **❗ This requires [Tippiecanoe](https://github.com/mapbox/tippecanoe) to be installed first.**
  - generate the ultimate final `trees.mbtiles` file, to be uploaded on [Mapbox Studio](https://www.mapbox.com/mapbox-studio/) as a [tileset](https://www.mapbox.com/help/define-tileset/).

## Copyright

- © [Trees.sg](http://trees.sg) © [National Parks Board](http://www.nparks.gov.sg/)
