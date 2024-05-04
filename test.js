const fs = require("fs");
const test = require("flug");
const shift = require("./index.js");

function distance([x0, y0], [x1, y1]) {
  // console.log("distance:", { x0, y0, x1, y1 });
  return Math.sqrt(Math.pow(x1 - x0, 2) + Math.pow(y1 - y0, 2));
}

function last(arr) {
  return arr[arr.length - 1];
}

const point = JSON.parse(fs.readFileSync("./test-data/Point.geojson", "utf-8"));
const FeaturePoint = {
  type: "Feature",
  properties: {},
  geometry: point
};
const polygon = JSON.parse(fs.readFileSync("./test-data/Polygon.geojson", "utf-8"));
const FeaturePolygon = {
  type: "Feature",
  properties: {},
  geometry: polygon
};
const FeatureCollectionPoint = {
  type: "FeatureCollection",
  features: [FeaturePoint, FeaturePoint]
};

test("example", ({ eq }) => {
  const shifted = shift(FeaturePolygon);
  // console.log(JSON.stringify(shifted, undefined, 2));
});

test("randomly shift a FeatureCollection of a Point a thousand times", ({ eq }) => {
  for (let i = 0; i < 100_000; i++) {
    const d = 0.5;
    const shifted = shift(FeatureCollectionPoint, { range: [0.49, 0.51] });
    const diff1 = distance(FeatureCollectionPoint.features[0].geometry.coordinates, shifted.features[0].geometry.coordinates);
    eq(Math.abs(diff1 - d) < 0.01, true);

    const diff2 = distance(FeatureCollectionPoint.features[0].geometry.coordinates, shifted.features[0].geometry.coordinates);
    eq(Math.abs(diff2 - d) < 0.01, true);
  }
});

test("randomly shift a Feature Point a thousand times", ({ eq }) => {
  for (let i = 0; i < 100_000; i++) {
    const d = 0.5;
    const shifted = shift(FeaturePoint, { range: [0.49, 0.51] });
    const diff = distance(point.coordinates, shifted.geometry.coordinates);
    eq(Math.abs(diff - d) < 0.01, true);
  }
});

test("randomly shift a Point a thousand times", ({ eq }) => {
  const point = JSON.parse(fs.readFileSync("./test-data/Point.geojson", "utf-8"));
  for (let i = 0; i < 100_000; i++) {
    const d = 0.5;
    const shifted = shift(point, { range: [0.49, 0.51] });
    const diff = distance(point.coordinates, shifted.coordinates);
    eq(Math.abs(diff - d) < 0.01, true);
  }
});

test("randomly shift a MultiPoint a thousand times", ({ eq }) => {
  const point = JSON.parse(fs.readFileSync("./test-data/MultiPoint.geojson", "utf-8"));
  for (let i = 0; i < 100_000; i++) {
    const d = 0.5;
    const shifted = shift(point, { range: [0.49, 0.51] });
    const distances = point.coordinates.map((pt, i) => distance(pt, shifted.coordinates[i]));
    eq(distances.length, 4);
    distances.forEach((dist) => eq(Math.abs(dist - d) < 0.01, true));
  }
});

test("randomly shift a Polygon a thousand times", ({ eq }) => {
  for (let i = 0; i < 1; i++) {
    const d = 0.5;
    const shifted = shift(polygon, { range: [0.49, 0.51] });
    const distances = shifted.coordinates[0].map((pt, i) => Math.abs(distance(pt, polygon.coordinates[0][i])));
    eq(distances.length, 5);
    distances.forEach((dist) => eq(Math.abs(dist - d) < 0.01, true));
    eq(shifted[0], shifted[shifted.length - 1]);
  }
});

test("randomly shift a MultiPolygon a thousand times", ({ eq }) => {
  const multiPolygon = JSON.parse(fs.readFileSync("./test-data/MultiPolygon.geojson", "utf-8"));
  for (let i = 0; i < 1; i++) {
    const d = 0.5;
    const shifted = shift(multiPolygon, { range: [0.49, 0.51] });
    const distances = shifted.coordinates[0][0].map((pt, i) => Math.abs(distance(pt, multiPolygon.coordinates[0][0][i])));
    eq(distances.length, 4);
    distances.forEach((dist) => eq(Math.abs(dist - d) < 0.01, true));
    eq(shifted[0], shifted[shifted.length - 1]);
  }
});

test("randomly shift a LineString a thousand times", ({ eq }) => {
  const lineString = JSON.parse(fs.readFileSync("./test-data/LineString.geojson", "utf-8"));
  for (let i = 0; i < 1; i++) {
    const d = 0.5;
    const shiftedCoords = shift(lineString, {
      range: [0.49, 0.51]
    }).coordinates;
    const distances = shiftedCoords.map((pt, i) => Math.abs(distance(pt, lineString.coordinates[i])));
    eq(distances.length, 3);
    distances.forEach((dist) => eq(Math.abs(dist - d) < 0.01, true));
    eq(shiftedCoords[0].toString() !== shiftedCoords[shiftedCoords.length - 1].toString(), true);
  }
});

test("randomly shift a MultiLineString a thousand times", ({ eq }) => {
  const multiLineString = JSON.parse(fs.readFileSync("./test-data/MultiLineString.geojson", "utf-8"));
  for (let i = 0; i < 1; i++) {
    const d = 0.5;
    const shifted = shift(multiLineString, { range: [0.49, 0.51] });

    // check first line string
    const distances1 = shifted.coordinates[0].map((pt, i) => Math.abs(distance(pt, multiLineString.coordinates[0][i])));
    eq(distances1.length, 3);
    distances1.forEach((dist) => eq(Math.abs(dist - d) < 0.01, true));
    eq(shifted.coordinates[0][0].toString() !== last(shifted.coordinates[0]).toString(), true);

    // check second line string
    const distances2 = shifted.coordinates[1].map((pt, i) => Math.abs(distance(pt, multiLineString.coordinates[1][i])));
    eq(distances2.length, 4);
    distances2.forEach((dist) => eq(Math.abs(dist - d) < 0.01, true));
    eq(shifted.coordinates[1][0].toString() !== last(shifted.coordinates[1]).toString(), true);
  }
});

test("randomly shift points for a geojson representing a country with a coastline", ({ eq }) => {
  const croatia = JSON.parse(fs.readFileSync("./test-data/Croatia.geojson", "utf-8"));
  const shifted = shift(croatia);
  eq(croatia.properties, shifted.properties);
  const difs = croatia.geometry.coordinates[0][0].map((pt, i) => distance(pt, shifted.geometry.coordinates[0][0][i]));
  eq(difs.length, 64);
  difs.forEach((d) => eq(Math.abs(d) < 0.0001, true));
});
