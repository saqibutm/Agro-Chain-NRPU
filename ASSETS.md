# AgroChain — Store & App Asset Checklist

Exact specs, naming scheme, and placement for every graphic needed to ship AgroChain.
Brand color: **green `#2e7d32`** · accent `#1565c0` · alert `#c62828`.

---

## A. In-app assets (bundled in the build, live in `./assets/`)

These already exist in the repo — **replace the placeholder art with AgroChain branding**
at the exact sizes below. Keep the filenames (referenced by `app.json`).

| File | Size (px) | Format | Notes |
|------|-----------|--------|-------|
| `assets/icon.png` | **1024 × 1024** | PNG, no transparency | Master app icon (Expo downscales for all densities) |
| `assets/adaptive-icon.png` | **1024 × 1024** | PNG, transparent | Android adaptive **foreground**; keep logo inside the centre **66%** safe zone (≈432 px radius) — outer area gets cropped to circle/squircle |
| `assets/splash.png` | **1284 × 2778** | PNG | Splash; logo centered, `resizeMode: contain`, bg `#ffffff` (set in `app.json`) |
| `assets/favicon.png` | **48 × 48** (or 196 × 196) | PNG | Web favicon |

> Adaptive icon background color is `#ffffff` (set in `app.json`). If your logo is green,
> ensure contrast against white.

---

## B. Google Play Store listing assets (uploaded in Play Console)

| Asset | Size (px) | Format | Required? | Console location |
|-------|-----------|--------|-----------|------------------|
| **App icon (hi-res)** | **512 × 512** | 32-bit PNG, **no alpha** | ✅ Required | Store listing → Graphics |
| **Feature graphic** | **1024 × 500** | PNG/JPG, no alpha | ✅ Required | Store listing → Graphics |
| **Phone screenshots** | 16:9 or 9:16; each side **320–3840** | PNG/JPG | ✅ Min 2 (rec 4–8) | Store listing → Graphics |
| 7" tablet screenshots | up to 3840 | PNG/JPG | Optional | Graphics |
| 10" tablet screenshots | up to 3840 | PNG/JPG | Optional | Graphics |
| Promo video (YouTube URL) | — | link | Optional | Graphics |

**Recommended phone screenshot size:** `1080 × 1920` (portrait, 9:16).

---

## C. Screenshot shot-list (capture from the app)

Capture in **both English and Urdu** if you want localized listings. Suggested 6:

| # | Screen | What to show | Filename |
|---|--------|--------------|----------|
| 1 | Home dashboard | KPI cards (batches, in transit, pass rate, quality flags) | `screen-01-dashboard.png` |
| 2 | Add Crop | batch form + GPS capture | `screen-02-addcrop.png` |
| 3 | QR Scanner | scanning a pack | `screen-03-scanner.png` |
| 4 | Product Journey | verified badge + farm-to-shelf timeline | `screen-04-journey.png` |
| 5 | Map | GPS custody route (markers + polyline) | `screen-05-map.png` |
| 6 | Settings | English/Urdu language toggle | `screen-06-language.png` |

Urdu variants: same names with `-ur` suffix, e.g. `screen-01-dashboard-ur.png`.

**How to capture:** `eas build --profile preview` (installable APK) or `npx expo start`
on a device/emulator, then take device screenshots at 1080×1920.

---

## D. Suggested repo layout for store art (not bundled in the app)

Create a `store/` folder (kept out of the build) to organize uploads:

```
store/
├── icon-512.png            # Play hi-res icon (no alpha)
├── feature-1024x500.png    # feature graphic
└── screenshots/
    ├── en/  screen-01..06.png
    └── ur/  screen-01..06-ur.png
```

> `store/` is for humans/Console uploads only; it isn't referenced by `app.json`, so it
> won't bloat the app bundle. Add `store/` to `.gitignore` if the art is large or private.

---

## E. Pre-upload checklist

- [ ] `assets/icon.png` and `assets/adaptive-icon.png` replaced with AgroChain logo (1024²)
- [ ] Adaptive foreground logo within the 66% safe zone
- [ ] `assets/splash.png` updated (centered logo on white)
- [ ] 512×512 hi-res icon exported **without alpha** (Play rejects alpha)
- [ ] 1024×500 feature graphic created
- [ ] ≥ 2 phone screenshots at 1080×1920 (rec. 6)
- [ ] Urdu screenshot set (if shipping a localized listing)
- [ ] All art uses brand green `#2e7d32` consistently

---

## F. Quick design notes

- **Icon:** simple mark that reads at 48px — e.g. a wheat/leaf glyph + chain link, green on
  white. Avoid fine text.
- **Feature graphic:** logo + tagline ("Farm-to-consumer traceability"), green background,
  keep important content centered (Play may overlay UI near edges).
- **Consistency:** match the in-app green so the icon, splash, and listing feel like one product.
