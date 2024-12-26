// utils/colorUtils.js
export const hexToXyb = (hex) => {
  const r = parseInt(hex.substring(1, 3), 16);
  const g = parseInt(hex.substring(3, 5), 16);
  const b = parseInt(hex.substring(5, 7), 16);

  const rgb = hexToRgb(hex);
  const normalizedR = rgb.r / 255;
  const normalizedG = rgb.g / 255;
  const normalizedB = rgb.b / 255;

  const gammaCorrect = (value) =>
    value > 0.04045
      ? Math.pow((value + 0.055) / (1.0 + 0.055), 2.4)
      : value / 12.92;

  const rLinear = gammaCorrect(normalizedR);
  const gLinear = gammaCorrect(normalizedG);
  const bLinear = gammaCorrect(normalizedB);

  const X =
    rLinear * 0.664511 + gLinear * 0.154324 + bLinear * 0.162028;
  const Y =
    rLinear * 0.283881 + gLinear * 0.668433 + bLinear * 0.047685;
  const Z =
    rLinear * 0.000088 + gLinear * 0.072310 + bLinear * 0.986039;

  const sum = X + Y + Z;
  const x = sum === 0 ? 0 : X / sum;
  const y = sum === 0 ? 0 : Y / sum;

  const bri = Math.round(Y * 254);

  return {
    x: parseFloat(x.toFixed(4)),
    y: parseFloat(y.toFixed(4)),
    bri: bri,
  };
}

export const rgbToHsv = (r, g, b) => {
  r /= 255; g /= 255; b /= 255;

  let max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, v = max;

  let d = max - min;
  s = max == 0 ? 0 : d / max;

  if (max == min) {
    h = 0; // achromatic
  } else {
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }

    h /= 6;
  }

  return [h, s, v];
}

/**
 * Converts an HSV color value to RGB. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSV_color_space.
 * Assumes h, s, and v are contained in the set [0, 1] and
 * returns r, g, and b in the set [0, 255].
 *
 * @param   Number  h       The hue
 * @param   Number  s       The saturation
 * @param   Number  v       The value
 * @return  Array           The RGB representation
 */
export const hsvToRgb = (h, s, v) => {
  let r = 0, g = 0, b = 0;

  // Normalize h, s, v if they are not already
  h = h % 360; // Ensure hue wraps correctly
  s = Math.min(Math.max(s, 0), 1); // Clamp s to [0, 1]
  v = Math.min(Math.max(v, 0), 1); // Clamp v to [0, 1]

  const c = v * s; // Chroma
  const x = c * (1 - Math.abs((h / 60) % 2 - 1)); // Second largest component
  const m = v - c; // Match brightness

  if (h >= 0 && h < 60) {
    [r, g, b] = [c, x, 0];
  } else if (h >= 60 && h < 120) {
    [r, g, b] = [x, c, 0];
  } else if (h >= 120 && h < 180) {
    [r, g, b] = [0, c, x];
  } else if (h >= 180 && h < 240) {
    [r, g, b] = [0, x, c];
  } else if (h >= 240 && h < 300) {
    [r, g, b] = [x, 0, c];
  } else if (h >= 300 && h <= 360) {
    [r, g, b] = [c, 0, x];
  }

  // Add m to each component and scale to 255
  r = Math.round((r + m) * 255);
  g = Math.round((g + m) * 255);
  b = Math.round((b + m) * 255);

  return { r, g, b };
};

export const hsvToHex = (h, s, v = 100) => {
  const rgb = hsvToRgb(h, s / 100, v / 100);
  return rgbToHex(rgb.r, rgb.g, rgb.b);
}

export const rgbToHex = (r, g, b) => {
  return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}



export const hexToRgb = (hex) => {
  // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
  var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  hex = hex.replace(shorthandRegex, function (m, r, g, b) {
    return r + r + g + g + b + b;
  });

  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

function componentToHex(c) {
  var hex = c.toString(16);
  return hex.length == 1 ? "0" + hex : hex;
}