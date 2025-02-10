import netCDF4 as nc
import numpy as np
import geojson
import argparse

def is_valid_temperature(value):
    return not np.isnan(value) and not np.isinf(value) and -100 <= value <= 150  # Fahrenheit range

# Set up argument parser to take the NetCDF file name as a command line argument
parser = argparse.ArgumentParser(description='Process NetCDF data and create a GeoJSON grid.')
parser.add_argument('netcdf_file', type=str, help='Path to the NetCDF file')

# Parse the arguments
args = parser.parse_args()

# Load the NetCDF data
netcdf_file = args.netcdf_file
ds = nc.Dataset(netcdf_file)

# Extract latitude, longitude, and 2m temperature data
latitude = ds.variables['latitude'][:]
longitude = ds.variables['longitude'][:]
temperature_kelvin = ds.variables['t2m'][0, :, :]  # 2-meter temperature in Kelvin

# Convert temperature from Kelvin to Fahrenheit
temperature_fahrenheit = (temperature_kelvin - 273.15) * 9/5 + 32

# Function to round coordinates to the nearest grid point
def snap_to_grid(value, grid_size):
    return round(value / grid_size) * grid_size

# Define grid size (adjust based on your data resolution)
grid_size = 0.1  # Example grid size; adjust as needed

# Create an empty list to store the grid features
grid_features = []

# Loop through the grid and calculate averages
for i in range(len(latitude) - 1):
    for j in range(len(longitude) - 1):
        # Snap the four corner points to the grid
        lat1 = snap_to_grid(latitude[i], grid_size)
        lat2 = snap_to_grid(latitude[i+1], grid_size)
        lon1 = snap_to_grid(longitude[j], grid_size)
        lon2 = snap_to_grid(longitude[j+1], grid_size)

        # Get the temperatures at the four corners
        temp1 = temperature_fahrenheit[i, j]
        temp2 = temperature_fahrenheit[i, j+1]
        temp3 = temperature_fahrenheit[i+1, j]
        temp4 = temperature_fahrenheit[i+1, j+1]
        if not (is_valid_temperature(temp1) and is_valid_temperature(temp2) and is_valid_temperature(temp3) and is_valid_temperature(temp4)):
            # Optionally log or print out invalid values for further investigation
            # print(f"Invalid temperatures found at grid cell ({i}, {j}):", temp1, temp2, temp3, temp4)
            continue
        # Calculate the average temperature for the grid cell
        avg_temp = np.mean([temp1, temp2, temp3, temp4])

        # Create the polygon (grid cell)
        polygon = geojson.Polygon([[
            [lon1, lat1],
            [lon2, lat1],
            [lon2, lat2],
            [lon1, lat2],
            [lon1, lat1]
        ]])

        # Create the feature with the average temperature
        feature = geojson.Feature(geometry=polygon, properties={'temperature_f': avg_temp})
        grid_features.append(feature)

# Create a GeoJSON FeatureCollection
grid_geojson = geojson.FeatureCollection(grid_features)

# Save to a GeoJSON file
output_file = 'grid.geojson'
with open(output_file, 'w') as f:
    geojson.dump(grid_geojson, f)

print(f"Grid GeoJSON created and saved to '{output_file}'.")