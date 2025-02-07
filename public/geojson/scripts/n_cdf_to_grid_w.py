import netCDF4 as nc
import numpy as np
import geojson
import argparse

# Set up argument parser to take the NetCDF file name as a command line argument
parser = argparse.ArgumentParser(description='Process NetCDF data and create a GeoJSON grid for wave height.')
parser.add_argument('netcdf_file', type=str, help='Path to the NetCDF file')

# Parse the arguments
args = parser.parse_args()

# Load the NetCDF data
netcdf_file = args.netcdf_file
ds = nc.Dataset(netcdf_file)

# Extract latitude, longitude, and wave height data
latitude = ds.variables['latitude'][:]
longitude = ds.variables['longitude'][:]
wave_height_meters = ds.variables['swh'][:, :]  # Adjusted slicing for 2D data (no time dimension)

# Convert wave height from meters to feet
wave_height_feet = wave_height_meters * 3.28084

# Function to round coordinates to the nearest grid point
def snap_to_grid(value, grid_size):
    return round(value / grid_size) * grid_size

# Define grid size (adjust based on your data resolution)
grid_size = 0.25  # Example grid size; adjust as needed

# Create an empty list to store the grid features
grid_features = []

# Loop through the grid and calculate averages, skipping NaN values
for i in range(len(latitude) - 1):
    for j in range(len(longitude) - 1):
        # Snap the four corner points to the grid
        lat1 = snap_to_grid(latitude[i], grid_size)
        lat2 = snap_to_grid(latitude[i+1], grid_size)
        lon1 = snap_to_grid(longitude[j], grid_size)
        lon2 = snap_to_grid(longitude[j+1], grid_size)

        # Get the wave heights at the four corners
        wave1 = wave_height_feet[i, j]
        wave2 = wave_height_feet[i, j+1]
        wave3 = wave_height_feet[i+1, j]
        wave4 = wave_height_feet[i+1, j+1]

        # Check for NaN values and skip if any of the wave heights are invalid
        if np.isnan(wave1) or np.isnan(wave2) or np.isnan(wave3) or np.isnan(wave4):
            continue

        # Calculate the average wave height for the grid cell
        avg_wave_height = np.mean([wave1, wave2, wave3, wave4])

        # If the average is still NaN, skip this feature
        if np.isnan(avg_wave_height):
            continue

        # Create the polygon (grid cell)
        polygon = geojson.Polygon([[
            [lon1, lat1],
            [lon2, lat1],
            [lon2, lat2],
            [lon1, lat2],
            [lon1, lat1]
        ]])

        # Create the feature with the average wave height
        feature = geojson.Feature(geometry=polygon, properties={'wave_height_ft': avg_wave_height})
        grid_features.append(feature)

# Create a GeoJSON FeatureCollection
grid_geojson = geojson.FeatureCollection(grid_features)

# Save to a GeoJSON file
output_file = 'wave_height_grid.geojson'
with open(output_file, 'w') as f:
    geojson.dump(grid_geojson, f)

print(f"Wave height GeoJSON created and saved to '{output_file}'.")
