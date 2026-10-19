// Genererar källbilder för ikoner/startbild (assets/) och butiksgrafik (store/). Kör: node tools-graphics.js
const sharp = require("sharp");
const O = "#e0661b", W = "#ffffff";
const envelope = (cx, cy, s) => {
  const w = 288 * s, h = 192 * s, x = cx - w / 2, y = cy - h / 2;
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${14 * s}" fill="${W}"/>
  <path d="M${x} ${y + 6 * s} L${cx} ${y + 112 * s} L${x + w} ${y + 6 * s}" fill="none" stroke="${O}" stroke-width="${22 * s}" stroke-linejoin="round" stroke-linecap="round"/>
  <text x="${cx}" y="${y + h - 26 * s}" font-family="Familjen Grotesk" font-weight="700" font-size="${64 * s}" fill="${O}" text-anchor="middle">kr</text>`;
};
const svg = (w, h, inner, bg) => Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${bg ? `<rect width="${w}" height="${h}" fill="${bg}"/>` : ""}${inner}</svg>`);
const out = (buf, file) => sharp(buf).png().toFile(file).then(() => console.log("✔", file));
(async () => {
  // Ikon utan adaptiv yta (1024), förgrund i säker zon (66 %), bakgrund
  await out(svg(1024, 1024, envelope(512, 512, 2.2), O), "assets/icon-only.png");
  await out(svg(1024, 1024, envelope(512, 512, 1.55)), "assets/icon-foreground.png");
  await out(svg(1024, 1024, "", O), "assets/icon-background.png");
  // Startbild ljus/mörk
  await out(svg(2732, 2732, envelope(1366, 1366, 2.2), "#f5f6f4"), "assets/splash.png");
  await out(svg(2732, 2732, envelope(1366, 1366, 2.2), "#141917"), "assets/splash-dark.png");
  // Butiksgrafik
  await out(svg(512, 512, envelope(256, 256, 1.1), O), "store/ikon-512.png");
  await out(svg(1024, 500, `
    <g transform="translate(170 250)">${envelope(0, 0, 0.72)}</g>
    <text x="320" y="228" font-family="Familjen Grotesk" font-weight="700" font-size="66" fill="${W}">Pension efter skatt</text>
    <text x="322" y="288" font-family="Instrument Sans" font-weight="500" font-size="28" fill="${W}" opacity=".92">Netto från allmän pension, premiepension</text>
    <text x="322" y="326" font-family="Instrument Sans" font-weight="500" font-size="28" fill="${W}" opacity=".92">och tjänstepension enligt årets skatteregler</text>`, O), "store/omslag-1024x500.png");
})();
