function isArray(it) {
  return typeof it === "object" && typeof it.length === "number";
}

function randomNumberWithinRange(min, max) {
  return min + (max - min) * Math.random();
}

function randomRadian() {
  return randomNumberWithinRange(0, 2 * Math.PI);
}

// mutates given point
function shiftPoint(point, opts) {
  const x = point[0];
  const y = point[1];
  const radian = randomRadian();
  const distance = randomNumberWithinRange(opts.min, opts.max);
  if (opts.contain && x >= -180 && x <= 180 && y >= -90 && y <= 90) {
    // make sure don't move from inside to outside the world
    for (let i = 0; i < 100; i++) {
      const x1 = x + distance * Math.cos(radian);
      const y1 = y + distance * Math.sin(radian);
      if (x1 >= -180 && x1 <= 180 && y1 >= -90 && y1 <= 90) {
        point[0] = x1;
        point[1] = y1;
        break;
      }
    }
  } else {
    point[0] = x + distance * Math.cos(radian);
    point[1] = y + distance * Math.sin(radian);
  }
}

function shiftMultiPoint(points, opts) {
  points.forEach(function (point) {
    shiftPoint(point, opts);
  });
}

function isClosed(ring) {
  const first = ring[0];
  const last = ring[ring.length - 1];
  return first[0] === last[0] && first[1] === last[1];
}

function shiftLineString(ring, opts) {
  ring.forEach(function (point) {
    shiftPoint(point, opts);
  });
}

function shiftMultiLineString(lineStrings, opts) {
  lineStrings.forEach(function (lineString) {
    shiftLineString(lineString, opts);
  });
}

function shiftRing(ring, opts) {
  const closed = isClosed(ring);
  ring.forEach(function (point) {
    shiftPoint(point, opts);
  });
  // make sure first and last point are the same
  if (closed) {
    ring[ring.length - 1][0] = ring[0][0];
    ring[ring.length - 1][1] = ring[0][1];
  }
  return ring;
}

function shiftPolygon(rings, opts) {
  rings.forEach(function (ring) {
    shiftRing(ring, opts);
  });
}

function shiftMultiPolygon(polygons, opts) {
  polygons.forEach(function (polygon) {
    shiftPolygon(polygon, opts);
  });
}

function shiftGeometry(it, opts) {
  if (it.type === "Point") {
    shiftPoint(it.coordinates, opts);
  } else if (it.type === "MultiPoint") {
    shiftMultiPoint(it.coordinates, opts);
  } else if (it.type === "Polygon") {
    shiftPolygon(it.coordinates, opts);
  } else if (it.type === "MultiPolygon") {
    shiftMultiPolygon(it.coordinates, opts);
  } else if (it.type === "LineString") {
    shiftLineString(it.coordinates, opts);
  } else if (it.type === "MultiLineString") {
    shiftMultiLineString(it.coordinates, opts);
  } else if (it.type === "Feature") {
    shiftGeometry(it.geometry, opts);
  } else if (it.type === "FeatureCollection" || Array.isArray(it.features)) {
    it.features.forEach(function (feature) {
      shiftGeometry(feature, opts);
    });
  } else {
    throw new Error("[geojson-random-shift] encountered unexpected object");
  }
  return it;
}

function geojsonRandomShift(geojson, options) {
  const debug_level = typeof options === "object" && typeof options.debug_level === "number" ? options.debug_level : 0;

  if (!(typeof options === "object" && options.mutate === true)) {
    if (debug_level >= 1) console.log("[geojson-random-shift] cloning geojson to prevent mutation");
    geojson = JSON.parse(JSON.stringify(geojson));
  }

  const range = typeof options === "object" && isArray(options.range) ? options.range : [1e-7, 1e-7];

  return shiftGeometry(geojson, {
    contain: (typeof options === "object" && options.contain) || true,
    debug_level,
    min: range[0],
    max: range[1]
  });
}

if (typeof window === "object") {
  window.geojsonRandomShift = geojsonRandomShift;
}

if (typeof self === "object") {
  self.geojsonRandomShift = geojsonRandomShift;
}

if (typeof define === "function" && define.amd) {
  define(function () {
    return geojsonRandomShift;
  });
}

if (typeof module === "object") {
  module.exports = geojsonRandomShift;
  module.exports.default = geojsonRandomShift;
}
