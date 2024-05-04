#!/bin/sh -e

echo "fetching"
wget https://github.com/DanielJDufour/geojson-test-data/archive/master.zip -O geojson-test-data.zip

echo "unzipping"
unzip -j -o geojson-test-data.zip "geojson-test-data-*/files/*" -d .

echo "cleaning"
rm geojson-test-data.zip
