# Pension efter skatt

Räknar fram brutto, skatt och netto per månad från allmän pension, premiepension och tjänstepension
enligt Skatteverkets regler. All beräkning sker i telefonen; inga uppgifter skickas någonstans.

Säljs som betald app i Google Play (19 kr, engångsköp).

## Struktur
| Sökväg | Innehåll |
| --- | --- |
| `calc.js` | Beräkningsmotorn (grundavdrag, skatter, avgifter) |
| `test.js` | Kontroller mot Skatteverkets gränsvärden – `node test.js` |
| `src/app.html` | Gränssnittet (källfil) |
| `build.py` | Bygger `index.html` (webb), `preview.html` och `app/www/` (Android, offline) |
| `android/` | Android-projektet (Capacitor 8, targetSdk 36) |
| `assets/`, `tools-graphics.js` | Källbilder för ikon och startbild |
| `store/` | Butiksgrafik för Google Play (ikon 512, omslag 1024×500) |
| `integritet.html`, `villkor.html` | Integritetspolicy och användarvillkor (publiceras via GitHub Pages) |
| `.github/workflows/android-release.yml` | Bygger signerad `.aab` i GitHub |

## Utgivare och paketnamn
- Utgivare: Fryslan Logistik AB, org.nr 559300-7064 (måste matcha D-U-N-S-registret och Play Console-kontot).
- Paketnamn: `app.pensionkalkylator` (omvänt domännamn för pension-kalkylator.app).
  **Kan aldrig ändras efter första uppladdningen i Play Console.**
- Adress: Gaterseredsvägen 35C, 427 50 Billdal.

## Uppladdningsnyckel (görs en gång, på din egen dator)
Kräver Java (keytool). Spara nyckelfilen och lösenorden säkert – utan dem kan du inte uppdatera appen
(Google kan återställa uppladdningsnyckeln, men det tar tid).

```
keytool -genkeypair -v -keystore upload.jks -alias upload -keyalg RSA -keysize 2048 -validity 10000
```

Gör om filen till text:
- macOS/Linux: `base64 -i upload.jks | tr -d '\n' > upload.b64`
- Windows PowerShell: `[Convert]::ToBase64String([IO.File]::ReadAllBytes("upload.jks")) | Out-File upload.b64`

Lägg in fyra hemligheter i GitHub: repot → Settings → Secrets and variables → Actions → New repository secret:

| Namn | Värde |
| --- | --- |
| `ANDROID_KEYSTORE_BASE64` | innehållet i `upload.b64` |
| `ANDROID_KEYSTORE_PASSWORD` | lösenordet till nyckelfilen |
| `ANDROID_KEY_ALIAS` | `upload` |
| `ANDROID_KEY_PASSWORD` | nyckelns lösenord (samma som ovan om du inte valde ett eget) |

Lägg **aldrig** `upload.jks` i repot (den är ignorerad i `.gitignore`).

## Bygga appfilen
GitHub → Actions → **Bygg Android-app** → Run workflow. Efter ca 5–10 min finns
`pension-efter-skatt-aab` att ladda ner under körningen. Ladda upp `app-release.aab` i Play Console.
Versionskoden sätts automatiskt från körnumret; versionsnamnet från `package.json`.

## Nytt inkomstår (varje december)
1. Lägg till året i `YEARS` i `calc.js` (prisbasbelopp, skiktgräns, public service-tak) från Skatteverkets SKV 433.
2. Lägg till kontroller i `test.js` och kör `node test.js`.
3. Höj `version` i `package.json`, pusha, kör byggflödet och ladda upp i Play Console.

## Lokalt
```
npm ci
node test.js
python3 build.py        # bygger webb, förhandsvisning och app/www
npx cap sync android    # kopierar app/www in i Android-projektet
```
Android Studio behövs bara om du vill köra appen i en emulator: `npx cap open android`.
