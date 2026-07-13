# Idle Turtle Balls

Et lite idle/clicker-spill bygget som en statisk nettside.

## Filer

- `index.html` - HTML-struktur
- `style.css` - all styling
- `script.js` - all gameplay-logikk
- `audio.js` - hendelsesbaserte Web Audio-effekter

## Idle-progresjon

Spillet lagrer en glattet versjon av faktisk gold per sekund. Ved retur gis 35 % offline-inntekt etter 30 sekunders fravaer, begrenset til 8 timer. Offline-progresjon gir gold, men hopper ikke over levels eller bosser.

## First Run & Balance

- HUD-en viser de ti stegene frem til neste boss og malet pa level 100.
- Forste hero-kast og forste kjop far visuelle signaler uten forklarende dialoger.
- `audio.js` gir lyd til kast, treff, crit, kjop, merge og boss-oyeblikk.
- Balansekontrakten bevarer startkostnad 20, forste PP ved 12K total gold og eksisterende HP-/crit-kurver.

## Hero Ball Skills

Weapon tree styrer bade hero-ballen i idle og hero-skuddene i bosskamper:

- Impact Core bygger combo og forlenger gode kast.
- Rail Drive refrakterer mot malet og piercer fra Tier 3.
- Blast Core gir eksplosive treff og proximity detonation.
- Razor Drive bygger ricochet-fart og cutting damage.
- Void Core styrer mot malet og skalerer med manglende HP.

## Tester

Kjor de lokale regresjonstestene med:

```powershell
node --check audio.js
node --check script.js
node tests/regression.test.js
```
