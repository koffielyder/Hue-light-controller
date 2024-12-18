// utils/colorUtils.js
export const hexToXyb = (hex) => {
    const r = parseInt(hex.substring(1, 3), 16);
    const g = parseInt(hex.substring(3, 5), 16);
    const b = parseInt(hex.substring(5, 7), 16);
  
    const normalizedR = r / 255;
    const normalizedG = g / 255;
    const normalizedB = b / 255;
  
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
  };
  