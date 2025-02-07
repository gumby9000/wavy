import netCDF4 as nc
import pandas as pd
import numpy as np

def k_to_f(k):
    return (k - 273.15) * 9/5 + 32

def netcdf_to_csv(netcdf_file, csv_file):
    # Open the NetCDF4 file
    ds = nc.Dataset(netcdf_file)
    
    # Extract latitude, longitude, and t2m data
    latitude = ds.variables['latitude'][:]
    longitude = ds.variables['longitude'][:]
    t2m = ds.variables['t2m'][:]
    
    t2m = k_to_f(t2m)
    # Create a meshgrid to pair each latitude with each longitude
    lon, lat = np.meshgrid(longitude, latitude)
    
    # Flatten the arrays for CSV output
    flat_lat = lat.flatten()
    flat_lon = lon.flatten()
    flat_t2m = t2m.flatten()
    
    # Create a DataFrame
    df = pd.DataFrame({
        'latitude': flat_lat,
        'longitude': flat_lon,
        't2m': flat_t2m
    })
    
    # Save the DataFrame to a CSV file
    df.to_csv(csv_file, index=False)
    
    print(f"Converted {netcdf_file} to {csv_file}")

# Example usage
netcdf_to_csv('042024.nc', '042024.csv')

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
netcdf_to_geojson('042024.nc', '042024.geojson')
