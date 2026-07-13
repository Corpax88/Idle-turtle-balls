# Idle Turtle Balls

Et lite idle/clicker-spill bygget som en statisk nettside.

## Filer

- `index.html` - HTML-struktur
- `style.css` - all styling
- `script.js` - all gameplay-logikk

## Idle-progresjon

Spillet lagrer en glattet versjon av faktisk gold per sekund. Ved retur gis 35 % offline-inntekt etter 30 sekunders fravaer, begrenset til 8 timer. Offline-progresjon gir gold, men hopper ikke over levels eller bosser.

## First Run & Balance

- HUD-en viser de ti stegene frem til neste boss og målet på level 100.
- Første hero-kast og første kjøp får visuelle signaler uten forklarende dialoger.
- `audio.js` gir hendelsesbasert lyd til kast, treff, crit, kjøp, merge og bossøyeblikk.
- Balansekontrakten bevarer startkostnad 20, første PP ved 12K total gold og eksisterende HP-/crit-kurver.

## Tester

Kjør de lokale regresjonstestene med:

```powershell
node --check audio.js
node --check script.js
node tests/regression.test.js
```
