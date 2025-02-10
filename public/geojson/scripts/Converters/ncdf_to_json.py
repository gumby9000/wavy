import netCDF4 as nc
import numpy as np
import json

def kelvin_to_fahrenheit(kelvin):
    return (kelvin - 273.15) * 9/5 + 32

def netcdf_to_geojson(netcdf_file, geojson_file):
    # Open the NetCDF4 file
    ds = nc.Dataset(netcdf_file)
    
    # Extract latitude, longitude, and t2m data
    latitude = ds.variables['latitude'][:]
    longitude = ds.variables['longitude'][:]
    t2m = ds.variables['t2m'][:]  # Temperature in Kelvin
    
    # Convert temperature from Kelvin to Fahrenheit
    t2m_fahrenheit = kelvin_to_fahrenheit(t2m)
    
    # Create a meshgrid to pair each latitude with each longitude
    lon, lat = np.meshgrid(longitude, latitude)
    
    # Flatten the arrays for GeoJSON output
    flat_lat = lat.flatten()
    flat_lon = lon.flatten()
    flat_t2m = t2m_fahrenheit.flatten()
    
    # Prepare GeoJSON structure
    geojson = {
        "type": "FeatureCollection",
        "features": []
    }
    
    # Populate the GeoJSON with points
    for lat, lon, temp in zip(flat_lat, flat_lon, flat_t2m):
        feature = {
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [lon, lat]
            },
            "properties": {
                "temperature_f": temp
            }
        }
        geojson["features"].append(feature)
    
    # Save the GeoJSON data to a file
    with open(geojson_file, 'w') as f:
        json.dump(geojson, f, indent=2)
    
    print(f"Converted {netcdf_file} to {geojson_file}")

# Example usage
netcdf_to_geojson('data_0.nc', '032024.geojson')
