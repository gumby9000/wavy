#import netCDF4 as nc
#import pandas as pd
#
## Function to convert NetCDF4 to CSV
#def netcdf_to_csv(netcdf_file, csv_file):
#    # Open the NetCDF4 file
#    ds = nc.Dataset(netcdf_file)
#    
#    # Extract all the variables from the dataset
#    data_dict = {}
#    for var in ds.variables:
#        data = ds.variables[var][:]
#        
#        # Check if the data is a numeric array (has ndim attribute)
#        if hasattr(data, 'ndim'):
#            data_dict[var] = data.flatten() if data.ndim > 1 else data
#        else:
#            data_dict[var] = data  # Assume it's a scalar or string and handle directly
#    
#    # Create a DataFrame from the extracted data
#    df = pd.DataFrame(data_dict)
#    
#    # Save the DataFrame to a CSV file
#    df.to_csv(csv_file, index=False)
#    
#    print(f"Converted {netcdf_file} to {csv_file}")
#
## Example usage
#netcdf_to_csv('042024.nc', '042024.csv')
#
import netCDF4 as nc

# Open the NetCDF file
file_path = '042024w.nc'
ds = nc.Dataset(file_path)

# Print the overall structure of the file
print(ds)

# Print information about each variable
print("\nVariables:\n")
for var_name in ds.variables:
    var = ds.variables[var_name]
    print(f"Name: {var_name}")
    print(f"Dimensions: {var.dimensions}")
    print(f"Shape: {var.shape}")
    print(f"Datatype: {var.dtype}")
    print(f"Attributes: {var.ncattrs()}")
    print(f"First few data points: {var[:5]}\n")  # Display the first few data points

# Optionally, explore the attributes
print("\nGlobal Attributes:\n")
for attr in ds.ncattrs():
    print(f"{attr}: {getattr(ds, attr)}")

# Close the dataset
ds.close()
