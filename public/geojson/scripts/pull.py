import cdsapi
import argparse
m = '01'
parser = argparse.ArgumentParser(description='Process NetCDF data and create a GeoJSON grid.')
parser.add_argument('m', type=str, help='Path to the NetCDF file')

args = parser.parse_args()
month = args.m 

url = 'https://cds-beta.climate.copernicus.eu/api'
key = '3f4c0a69-a033-4c50-af48-93e40408249e' 

client = cdsapi.Client(url = url, key = key) 
dataset = "reanalysis-era5-single-levels-monthly-means"
request = {
    'product_type': ['monthly_averaged_reanalysis'],
    'variable': ['2m_temperature'],
    'year': ['2024'],
    'month': [m],
    'time': ['00:00'],
    'data_format': 'netcdf',
    'download_format': 'unarchived',
    'area': [49, -125, 23, -65]
}

client.retrieve(dataset, request).download(m + '2024.nc')