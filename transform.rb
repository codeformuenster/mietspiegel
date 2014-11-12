require 'json'

raw_data = JSON.parse(File.open('immobilienscout24_raw.json').read)

transformed_data = raw_data['polygons'].map do |p|
  { type: "Feature",
    geometry: {
      type: "MultiPolygon",
      coordinates: p['polygon'].map do |poly|
        [
          poly.map do |ipoly|
            [ipoly['lng'],ipoly['lat']]
          end
        ]
      end,
    },
    properties: {
      data: p['dataMap'],
      key: p['key'],
      areaName: p['areaName']
    }
  }
end

geojson = { type: "FeatureCollection", features: transformed_data }

File.open('immobilienscout24.json', 'w') do |f|
  f.write(geojson.to_json)
end
