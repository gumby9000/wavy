export const roundToHundredth = (num) => Math.round(num * 100) / 100;

export const dirToWord = (deg) => {
  if ((deg >= 0 && deg < 15) || (deg >= 345 && deg < 360)) {
    return 'N';
  }
  else if (deg >= 330 && deg < 345)
    return 'NNW';
  else if (deg >= 300 && deg < 330)
    return 'NW';
  else if (deg >= 285 && deg < 300)
    return 'WNW';
  else if (deg >= 255 && deg < 285)
    return 'W';
  else if (deg >= 240 && deg < 255)
    return 'WSW';
  else if (deg >= 210 && deg < 240)
    return 'SW';
  else if (deg >= 195 && deg < 210)
    return 'SSW';
  else if (deg >= 165 && deg < 195)
    return 'S';
  else if (deg >= 150 && deg < 165)
    return 'SSE';
  else if (deg >= 120 && deg < 150)
    return 'SE';
  else if (deg >= 105 && deg < 120)
    return 'ESE';
  else if (deg >= 75 && deg < 105)
    return 'E';
  else if (deg >= 60 && deg < 75)
    return 'ENE';
  else if (deg >= 30 && deg < 60)
    return 'NE';
  else if (deg >= 15 && deg < 30)
    return 'NNE';
};