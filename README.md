# geojson-random-shift
> Randomly Shift Coordinates in a GeoJSON

## install
```js
npm install geojson-random-shift
```

## basic usage
```js
import randomShift from "geojson-random-shift";

const geojson = {
  "type": "Feature",
  "properties": {},
  "geometry": {
    "type": "Polygon",
    "coordinates": [
        [
            [30.0, 10.0],
            [40.0, 40.0],
            [20.0, 40.0],
            [10.0, 20.0],
            [30.0, 10.0]
        ]
    ]
  }
};

randomShift(geojson);
{
  "type": "Feature",
  "properties": {},
  "geometry": {
    "type": "Polygon",
    "coordinates": [
      [
        [
          29.999999951435843,
          10.000000087415803
        ],
        [
          40.000000086127606,
          39.99999994918626
        ],
        [
          19.999999944247676,
          40.00000008301613
        ],
        [
          10.000000031702344,
          19.99999990515823
        ],
        [
          29.999999951435843,
          10.000000087415803
        ]
      ]
    ]
  }
}
```

## advanced usage
### specifying distance threshold
You can specify a range of how much a coordinate should move.
By default a coordinate will shift 0.0000001 degrees.
```js
// each coordinate in the geojson must move between 10 and 100 degrees
randomShift(geojson, { range: [10, 100] });
```

### containing to the world
By default randomShift double checks and makes sure to points move outside of the traditional world bounding box of [-180, -90, 180, 90].  You can turn this off by the following:
```js
randomShift(geojson, { contain: false });
```

### debug_level
You can change the debug level, which will log more information:
```js
randomShift(geojson, { debug_level: 10 });
```

### mutate
By default, geojson-random-shift clones the input to prevent mutation.
If you don't care about saving the original geojson,
you can turn this off for a big speed up.
```js
randomShift(geojson, { mutate: true });
```