/* Pensionsskatt – beräkningsmotor
 * Källa: Skatteverket, Teknisk beskrivning SKV 433 (2026, utgåva 36)
 *        Skatteverket, Belopp och procent – inkomstår 2026
 * Alla belopp i kronor. Beräkningen avser slutlig skatt på helår.
 */
(function (root) {
  'use strict';

  // Årsparametrar. Lägg till nytt år när Skatteverket publicerat det.
  var YEARS = {
    2026: {
      pbb: 59200,          // prisbasbelopp
      skiktgrans: 643000,  // skiktgräns statlig inkomstskatt
      statligSats: 0.20,
      psMax: 1184,         // public service-avgift, tak (1 % upp till 1,42 IBB)
      psSats: 0.01,
      begravningDefault: 0.292
    }
  };

  function params(year) {
    if (YEARS[year]) return { year: year, p: YEARS[year], exact: true };
    var ys = Object.keys(YEARS).map(Number).sort(function (a, b) { return a - b; });
    var use = year > ys[ys.length - 1] ? ys[ys.length - 1] : ys[0];
    return { year: use, p: YEARS[use], exact: false };
  }

  var floor100 = function (x) { return Math.floor(x / 100) * 100; };
  var ceil100 = function (x) { return Math.ceil(x / 100) * 100; };

  // Ordinarie grundavdrag (oavrundat), FFI = fastställd förvärvsinkomst
  function grundavdragOrdinarie(ffi, pbb) {
    var g;
    if (ffi <= 0.99 * pbb) g = 0.423 * pbb;
    else if (ffi <= 2.72 * pbb) g = 0.423 * pbb + 0.20 * (ffi - 0.99 * pbb);
    else if (ffi <= 3.11 * pbb) g = 0.77 * pbb;
    else if (ffi <= 7.88 * pbb) g = 0.77 * pbb - 0.10 * (ffi - 3.11 * pbb);
    else g = 0.293 * pbb;
    return Math.min(g, ffi);
  }

  // Förhöjt grundavdrag för den som fyllt 66 år vid årets ingång (oavrundat)
  function grundavdragForhojt(ffi, pbb) {
    var b = pbb;
    if (ffi <= 0.91 * b) return 0.687 * b;
    if (ffi <= 1.11 * b) return 0.885 * b - 0.20 * ffi;
    if (ffi <= 1.965 * b) return 0.600 * b + 0.057 * ffi;
    if (ffi <= 2.72 * b) return 0.333 * b + 0.1949 * ffi;
    if (ffi <= 3.11 * b) return 0.3949 * ffi - 0.212 * b;
    if (ffi <= 3.24 * b) return 0.4949 * ffi - 0.523 * b;
    if (ffi <= 5.00 * b) return 0.356 * ffi - 0.073 * b;
    if (ffi <= 7.88 * b) return 0.017 * b + 0.338 * ffi;
    if (ffi <= 8.08 * b) return 0.703 * b + 0.251 * ffi;
    if (ffi <= 11.16 * b) return 2.732 * b;
    if (ffi <= 12.84 * b) return 9.651 * b - 0.62 * ffi;
    return 1.691 * b;
  }

  // Skattereduktion för förvärvsinkomst (räknas av mot kommunal skatt)
  function reduktionForvarvsinkomst(bfi) {
    if (bfi <= 40000) return 0;
    if (bfi <= 240000) return 0.0075 * (bfi - 40000);
    return 1500;
  }

  /**
   * in: { allman, premie, tjanste } (kr/mån brutto), fodelsear,
   *     kommunal (%), begravning (%), kyrka (%), year
   */
  function berakna(inp) {
    var pr = params(inp.year);
    var p = pr.p;
    var manad = (+inp.allman || 0) + (+inp.premie || 0) + (+inp.tjanste || 0);
    var ar = manad * 12;
    var ffi = floor100(ar);

    var forhojt = inp.fodelsear > 0 && inp.fodelsear <= pr.year - 67;
    var ga = grundavdragOrdinarie(ffi, p.pbb) + (forhojt ? grundavdragForhojt(ffi, p.pbb) : 0);
    ga = Math.min(ceil100(ga), ffi);
    var bfi = Math.max(0, ffi - ga);

    var kommunalFore = Math.floor(bfi * (inp.kommunal || 0) / 100);
    var reduktion = Math.min(Math.floor(reduktionForvarvsinkomst(bfi)), kommunalFore);
    var kommunal = kommunalFore - reduktion;
    var statlig = Math.floor(Math.max(0, bfi - p.skiktgrans) * p.statligSats);
    var begravning = Math.floor(bfi * (inp.begravning || 0) / 100);
    var kyrka = Math.floor(bfi * (inp.kyrka || 0) / 100);
    var ps = Math.floor(Math.min(bfi * p.psSats, p.psMax));
    var total = kommunal + statlig + begravning + kyrka + ps;

    // Preliminärt skatteavdrag hos respektive utbetalare (valfri sats per pension).
    // Tom sats (null) = kommunalskattesatsen används. Visas bara om minst en sats är ifylld.
    var prelim = null;
    var sats = inp.satser || {};
    if (['allman', 'premie', 'tjanste'].some(function (k) { return sats[k] != null; })) {
      var poster = {};
      var prelimManad = 0;
      ['allman', 'premie', 'tjanste'].forEach(function (k) {
        var s = sats[k] != null ? sats[k] : (inp.kommunal || 0);
        var avdrag = (+inp[k] || 0) * s / 100;
        poster[k] = { sats: s, avdrag: avdrag };
        prelimManad += avdrag;
      });
      prelim = {
        poster: poster,
        avdragManad: prelimManad,
        nettoManad: manad - prelimManad,
        // positivt = återbäring, negativt = kvarskatt (per år)
        skillnadAr: prelimManad * 12 - total
      };
    }

    return {
      year: pr.year, exactYear: pr.exact, forhojt: forhojt,
      ar: { brutto: ar, grundavdrag: ga, beskattningsbar: bfi, kommunal: kommunal,
            reduktion: reduktion, statlig: statlig, begravning: begravning,
            kyrka: kyrka, publicService: ps, total: total, netto: ar - total },
      manad: {
        brutto: manad,
        kommunal: kommunal / 12, statlig: statlig / 12,
        avgifter: (begravning + kyrka) / 12, publicService: ps / 12,
        total: total / 12, netto: manad - total / 12
      },
      prelim: prelim,
      overSkiktgrans: bfi > p.skiktgrans,
      skiktgrans: p.skiktgrans
    };
  }

  var api = { berakna: berakna, YEARS: YEARS, grundavdragOrdinarie: grundavdragOrdinarie,
              grundavdragForhojt: grundavdragForhojt };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.PensionCalc = api;
})(this);
