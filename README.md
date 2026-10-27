# Pärlplattemakaren

Gör pärlplattemönster av bilder, med plocklista och utskrift i verklig storlek. Allt räknas ut i webbläsaren, bilden skickas ingenstans.

Sidan kan installeras som app (på iPad: Dela → Lägg till på hemskärmen) och fungerar sedan offline.

## Struktur

| Fil | Innehåll |
| --- | --- |
| `index.html`, `css/` | Sidan, stilar och lokala typsnitt |
| `js/color.js` | Färgrymd (sRGB → CIELAB), CIEDE2000 och matchning mot pärlfärger |
| `js/palette.js` | Pärlfärger och symboler |
| `js/shapes.js` | Plattformer och pinnarnas layout |
| `js/image.js` | Bildsampling och huvudberäkningen |
| `js/samples.js` | Exempelbilderna, ritade med kod |
| `js/render.js`, `js/print.js` | Ritning på skärmen och utskriftsbilden |
| `js/ui.js` | Kopplingen till sidan |
| `sw.js`, `manifest.webmanifest`, `icons/` | PWA: offline och installation |

## Köra lokalt

ES-moduler och service worker kräver att sidan serveras över http, till exempel:

```sh
python3 -m http.server
```

och öppna http://localhost:8000. Lokalt heter service workerns cache `parlplatta-dev`; använd "Update on reload" i webbläsarens utvecklarverktyg om du ändrar filer.

## Tester

```sh
npm test
```

Kräver Node 22 eller senare, inga beroenden.

Lägger du till en fil i `css/`, `js/`, `fonts/` eller `icons/` måste den också läggas in i `ASSETS` i `sw.js`; ett test kontrollerar det.

## Publicering

`.github/workflows/pages.yml` kör testerna och publicerar till GitHub Pages vid varje push till `main`. Versionen i `sw.js` byts mot commitens SHA, så installerade appar hämtar den nya versionen nästa gång de startas med nät.

Första gången: välj **Settings → Pages → Build and deployment → Source: GitHub Actions** i repot.
