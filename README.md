# Pension efter skatt

Webbapp som räknar fram brutto, skatt och netto per månad från allmän pension, premiepension och tjänstepension.
All beräkning sker i webbläsaren. Inga uppgifter skickas någonstans.

## Regler (inkomstår 2026)
Källa: Skatteverket, *Teknisk beskrivning SKV 433, 2026 (utgåva 36)* och *Belopp och procent – inkomstår 2026*.

- Grundavdrag och förhöjt grundavdrag (fyllt 66 år vid årets ingång) enligt SKV 433, summan avrundad uppåt till helt hundratal
- Skattereduktion för förvärvsinkomst, avräknas mot kommunal skatt
- Statlig skatt 20 % av beskattningsbar inkomst över skiktgränsen 643 000 kr
- Public service-avgift 1 %, högst 1 184 kr/år
- Begravnings- och kyrkoavgift på beskattningsbar inkomst
- Ingen allmän pensionsavgift och inget jobbskatteavdrag på pension

## Filer
| Fil | Innehåll |
| --- | --- |
| `index.html` | Färdig app (byggd, publiceras av GitHub Pages) |
| `calc.js` | Beräkningsmotorn |
| `src/app.html` | Gränssnittet, källfil |
| `build.py` | Bygger `index.html` från `src/app.html` + `calc.js` |
| `test.js` | Kontroller mot Skatteverkets gränsvärden |

## Nytt inkomstår
Lägg till året i `YEARS` i `calc.js`, kör `node test.js` och `python3 build.py`.

## Publicera
Settings → Pages → Source: *Deploy from a branch*, branch `main`, mapp `/ (root)`.
Appen nås sedan på `https://seijokeseijoke-dev.github.io/pension/`.
