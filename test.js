// Kör: node test.js  – kontrollerar mot Skatteverkets gränsvärden 2026
const c = require("./calc.js");
const t = (m, by) => c.berakna({ allman: m, premie: 0, tjanste: 0, fodelsear: by, kommunal: 32.5, begravning: 0.292, kyrka: 0, year: 2026 });
let fel = 0;
const ok = (n, a, b) => { const p = a === b; if (!p) fel++; console.log((p ? "OK  " : "FEL ") + n + ": " + a + " (förväntat " + b + ")"); };
ok("Max ordinarie grundavdrag", t(170000 / 12, 1980).ar.grundavdrag, 45600);
ok("Max grundavdrag 66+", t(500000 / 12, 1957).ar.grundavdrag, 179100);
ok("Brytpunkt under 66, 660 400", t(660400 / 12, 1980).ar.statlig, 0);
ok("Brytpunkt under 66, 660 500", t(660500 / 12, 1980).ar.statlig, 20);
ok("Brytpunkt 66+, 760 500", t(760500 / 12, 1957).ar.statlig, 0);
ok("Brytpunkt 66+, 760 600", t(760600 / 12, 1957).ar.statlig, 20);
ok("Född 1959 får förhöjt", t(25000, 1959).forhojt, true);
ok("Född 1960 får inte förhöjt", t(25000, 1960).forhojt, false);
// Preliminärt avdrag per utbetalare
const pr = c.berakna({ allman: 14000, premie: 0, tjanste: 9000, satser: { allman: null, premie: null, tjanste: 30 },
  fodelsear: 1957, kommunal: 32.5, begravning: 0.292, kyrka: 0, year: 2026 }).prelim;
ok("Avdrag: 14000×32,5 % + 9000×30 %", Math.round(pr.avdragManad), Math.round(14000 * 0.325 + 9000 * 0.30));
ok("Utan satser ingen preliminär vy", c.berakna({ allman: 14000, premie: 0, tjanste: 9000, fodelsear: 1957, kommunal: 32.5, year: 2026 }).prelim, null);
process.exit(fel ? 1 : 0);
