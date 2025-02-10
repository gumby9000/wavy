import cdsapi
index = 2
while(index < 13):
  print('INDEX: ' + str(index))
  #m = ('0' + str(index)) if index < 10 else str(index)
  if(index <10):
    m = '0' + str(index)
  else:
    m = str(index)

  dataset = "reanalysis-era5-single-levels-monthly-means"
  request = {
      "product_type": ["monthly_averaged_reanalysis"],
      "variable": [
          "10m_u_component_of_wind",
          "10m_v_component_of_wind",
          "2m_temperature",
          "mean_wave_direction",
          "mean_wave_period",
          "sea_surface_temperature",
          "significant_height_of_combined_wind_waves_and_swell",
          "total_precipitation"
      ],
      "year": ["2024"],
      "month": [m],
      "time": ["00:00"],
      "data_format": "netcdf",
      "download_format": "unarchived",
      "area": [90, -180, -90, 180]
  }

  client = cdsapi.Client()
  client.retrieve(dataset, request).download('./2024/'+ m + '2024.nc')

  index+=1