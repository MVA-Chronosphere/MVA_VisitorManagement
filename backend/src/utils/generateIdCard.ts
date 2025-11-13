import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import QRCode from "qrcode";
import { Types } from "mongoose";
import e from "express";

export interface VisitorType {
  _id: string | Types.ObjectId;
  name: string;
  reason: string;
  department?: string | null;
  description?: string | null;
  hostEmail?: string | null;
  photo?: string;
  createdAt?: Date;
}

export const generateIdCard = async (visitor: VisitorType): Promise<string> => {
  try {
    const departmentToMapUrl: Record<string, string> = {
      "Front Office & Vision Paradise": "https://maps.app.goo.gl/u63me5B9oL8kthxN7",
      "Vision Petals": "https://maps.app.goo.gl/JJPvNuotKCzQPgE76",
      "Vision Mantra": "https://maps.app.goo.gl/6n7WVAThaAMjvx5u5",
      "Barakat Office": "https://maps.app.goo.gl/hYanuGeUrnkWtJ5w8",
      "Whitehouse": "https://maps.app.goo.gl/zNBv5nKvXfUtiz2W8",
      "Mini Tajmahal": "https://maps.app.goo.gl/imiDoTPcvJEG9dvU6",
      "Vision Udaan": "https://maps.app.goo.gl/gDoT7qgfNaK5zxpJ9",
      "Vision Divine": "https://maps.app.goo.gl/S4cSidfuiJpgrEBJA",
      "Chronosphere": "https://maps.app.goo.gl/QezHFVLNdnJ3fRBS9",
      "Nacl": "https://maps.app.goo.gl/R4E5LivSudeQSGdR7",
      "All is well Hospital": "https://maps.app.goo.gl/MS2RLFSMP2aNnXLb8",
      "Vision Vista": "https://maps.app.goo.gl/wZ2CTUc9vXEg7cnDA",
      "Josh Club": "https://maps.app.goo.gl/372SB47GrCTPMnUr7",
      "Vision Passion": "https://maps.app.goo.gl/SwgWBjSMd5EJ1nWM8",
    };

    const outputDir = path.join("uploads", "idcards");
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

    const filePath = path.join(outputDir, `${visitor._id}.pdf`);
    const doc = new PDFDocument({
      size: "A5",
      layout: "portrait",
      margin: 20,
    });

    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    const pageWidth = doc.page.width;
    const foldY = doc.page.height / 2;

    // Background
    doc.rect(0, 0, pageWidth, doc.page.height).fill("#f7f9fc");

    // Border
    doc.rect(10, 10, pageWidth - 20, doc.page.height - 20)
       .lineWidth(2)
       .strokeColor("#1c2a39")
       .stroke();

    // ==============================
    // FRONT SIDE (TOP HALF)
    // ==============================
    const frontTop = 20;

    // HEADER
    const headerH = 60;
    doc.rect(10, 10, pageWidth - 20, headerH).fill("#005bbb");

    const logoPath = path.join("uploads", "logo.png");
    if (fs.existsSync(logoPath)) {
      doc.image(logoPath, 25, 18, { width: 42 });
    }

    doc.fillColor("#ffffff")
       .font("Helvetica-Bold")
       .fontSize(22)
       .text("VISITOR PASS", 0, 26, { align: "center" });

    // Visitor DETAILS CARD
    const cardTop = headerH + 25;
    // Calculate maximum card height to not exceed the fold line (with margin)
    const maxCardHeight = foldY - cardTop - 15; // 15 point margin before fold line
    doc.roundedRect(25, cardTop, pageWidth - 50, maxCardHeight, 12)
       .fill("#ffffff")
       .strokeColor("#d0d7df")
       .lineWidth(1)
       .stroke();

    let y = cardTop + 20;
    const labelX = 40;
    const valueX = 150;

    const label = (t: string) =>
      doc.font("Helvetica-Bold").fillColor("#003366").fontSize(12).text(t, labelX, y);

    const value = (v: string) =>
      doc.font("Helvetica").fillColor("#111").fontSize(12).text(v, valueX, y);

    label("Name:");
    value(visitor.name ?? "-"); y += 28;

    label("Reason:");
    value(visitor.reason ?? "-"); y += 28;

    label("Email:");
    value(visitor.hostEmail || "-"); y += 28;

    label("Description:");
    doc.font("Helvetica")
       .fillColor("#111")
       .fontSize(12)
       .text(visitor.description || "-", valueX, y, { width: 180 }); 
    y += 55;

    label("Date:");
    value(new Date(visitor.createdAt ?? new Date()).toLocaleString()); 
    y += 40;

    // SIGNATURE LINE
    doc.font("Helvetica-Bold")
       .fontSize(12)
       .fillColor("#003366")
       .text("Signature:", labelX, y);

    doc.moveTo(valueX, y + 12)
       .lineTo(valueX + 140, y + 12)
       .strokeColor("#005bbb")
       .lineWidth(1.3)
       .stroke();

    // PHOTO
    const photoSize = 90;
    const px = pageWidth - photoSize - 45;
    const py = cardTop + 20;

    doc.roundedRect(px - 4, py - 4, photoSize + 8, photoSize + 8, 10)
       .strokeColor("#b8c2cc")
       .lineWidth(1)
       .stroke();

    if (visitor.photo && visitor.photo.startsWith("data:image")) {
      const base64 = visitor.photo.split(",")[1];
      const tempP = path.join("uploads", `${visitor._id}_photo.jpg`);
      fs.writeFileSync(tempP, Buffer.from(base64, "base64"));
      doc.image(tempP, px, py, { width: photoSize, height: photoSize });
      fs.unlinkSync(tempP);
    } else {
      doc.fontSize(12).fillColor("#7f8c8d")
         .text("No Photo", px, py + 34, { width: photoSize, align: "center" });
    }

    // ==============================
    // FOLD LINE
    // ==============================
    doc.moveTo(20, foldY)
       .lineTo(pageWidth - 20, foldY)
       .dash(4, { space: 3 })
       .strokeColor("#adb5bd")
       .stroke()
       .undash();

    // ==============================
    // BACK SIDE (BOTTOM HALF)
    // ==============================
    let backTop = foldY + 30;

    doc.font("Helvetica-Bold")
       .fillColor("#555")
       .fontSize(14)
       .text("LOCATION & DIRECTIONS", 0, backTop, { align: "center" });

    backTop += 30;

    // MAP
    const mapP = path.join("uploads", "map.png");
    const mw = 260, mh = 150;
    const mx = (pageWidth - mw) / 2;

    if (fs.existsSync(mapP)) {
      doc.image(mapP, mx, backTop, { width: mw, height: mh });
      doc.rect(mx - 2, backTop - 2, mw + 4, mh + 4)
         .strokeColor("#c1c7cd")
         .lineWidth(0.8)
         .stroke();
    } else {
      doc.fontSize(12).fillColor("#aaa")
         .text("Map unavailable", mx + 70, backTop + 60);
    }

    // QR CODE
    const url = departmentToMapUrl[(visitor.department ?? "").trim()]
      || "https://maps.app.goo.gl/z2CYb42fzrXJmnVV6";

    const qr = await QRCode.toBuffer(url);
    const qrPath = path.join("uploads", `${visitor._id}_qr.png`);
    fs.writeFileSync(qrPath, qr);

    const qrw = 40; // Smaller QR code
    const qrx = (pageWidth - qrw) / 2;
    const qry = backTop + mh + 20;

    doc.image(qrPath, qrx, qry, { width: qrw });
    fs.unlinkSync(qrPath);

    // Position text beside the QR code
    doc.fontSize(10)
       .fillColor("#555")
       .text("Scan for location", qrx + qrw + 10, qry + (qrw / 2) - 5, { width: 80 });

    doc.end();
    await new Promise<void>(res => stream.on("finish", () => res()));

    return filePath;
  } catch (err) {
    console.error("Error:", err);
    throw err;
  }
};
 export default generateIdCard;
