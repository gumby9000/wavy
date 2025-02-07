import cdsapi

dataset = "reanalysis-era5-single-levels-monthly-means"
request = {
    'product_type': ['monthly_averaged_reanalysis'],
    'variable': ['2m_temperature'],
    'year': ['2024'],
    'month': ['02'],
    'time': ['00:00'],
    'data_format': 'netcdf',
    'download_format': 'unarchived',
    'area': [31, -87.63, 24.39, -80]
}

client = cdsapi.Client()
client.retrieve(dataset, request).download()