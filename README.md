# Idle Turtle Balls v0.70.0

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
- Nye spillere ledes visuelt gjennom Ball, Speed, Merge, Hearts, Upgrades og Hero HP.
- Arenaen pauses ved hvert nytt steg, mens riktig knapp pulserer uten forklarende dialoger.
- Prestige introduseres fra level 40, viser faktisk PP-utbetaling og leder spilleren videre til sitt forste Gold Income-kjop etter resetten.
- PP bruker Prestiges cyan-identitet i HUD og knapper, mens Hearts beholder lilla som egen valuta.
- Eksisterende lagringer hopper automatisk over introduksjonen.
- `audio.js` gir lyd til kast, treff, crit, kjop, merge og boss-oyeblikk.
- Balansekontrakten bevarer startkostnad 20, forste PP ved 12K total gold og eksisterende HP-/crit-kurver.

## Hero Ball Skills

Weapon tree styrer bade hero-ballen i idle og hero-skuddene i bosskamper:

- Impact Core bygger combo og forlenger gode kast.
- Rail Drive refrakterer mot malet og piercer fra Tier 3.
- Blast Core gir eksplosive treff og proximity detonation.
- Razor Drive bygger ricochet-fart og cutting damage.
- Void Core styrer mot malet og skalerer med manglende HP.

## Hero Momentum

- Aktive treff med Hero Ball fyller en segmentert ring rundt ballen.
- Fem raske treff utloser fire sekunder Overdrive.
- Overdrive gir 18 % mer ballfart, 12 % mer gold og 25 % mer Hero Ball-skade.
- Nye treff kan forlenge Overdrive litt, mens Momentum avtar rolig etter inaktivitet.
- Dev-menyens Session Report samler launches, treff, Overdrives, kjop, merges, bossresultater og progresjon uten a endre save-filen.

## Boss Flow

- Bosshelten reagerer raskere og holdes over fingeren under touch-styring.
- Bossens rage-faser har en tydelig wind-up og et kort stun-vindu uten nye angrep.
- Heart-prisen styres av antall Hearts som er kjopt, ikke hvor mange spilleren har igjen.
- Rarity-oppgraderinger viser eksakt endring i shiny- og legendary-sjanse.
- Merge gir en faktisk kompresjonsbonus som bade forhåndsvises og brukes av den nye ballen.
- Prestige-knapp, bekreftelse og utbetaling bruker samme PP-beregning.

## Tester

Kjor de lokale regresjonstestene med:

```powershell
node --check audio.js
node --check script.js
node tests/regression.test.js
```
