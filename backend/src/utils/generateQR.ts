import QRCode from "qrcode";

export const generateQR = async (text) => {
  try {
    const qrData = await QRCode.toDataURL(text);
    return qrData;
  } catch (err) {
    console.error("QR generation error:", err);
    return null;
  }
};
