# BiSub — dual subtitles + pinyin

Chrome extension that shows two subtitle lines (original + translation) on YouTube, iQ, Viki, Youku, WeTV and iflix, with pinyin above Chinese characters.

> ⚠️ **Private repository, personal use only.** Part of this code is third-party, all rights reserved by its original authors. Do not make this repo public or redistribute it.

## Features

| Feature | Details |
|---|---|
| **No account** | No sign-up, API key or external service other than Google Translate. |
| **Translation via Google** | `background.js` translates subtitles through Google Translate (`clients5.google.com`). Only the subtitle text is sent. |
| **Synced sentences** | Subtitle fragments are merged into full sentences before translating, so each line and its translation have the same timing and full context. |
| **Pinyin** | Chinese lines show pinyin above every character (`<ruby>`), generated locally by [pinyin-pro](https://github.com/zh-lx/pinyin-pro) 3.29.5 (MIT), with word-aware tones for polyphones (多音字). |
| **1 s linger** | A subtitle stays on screen 1 extra second when silence follows, so you can finish reading. |
| **No empty bar** | The dark "Text Background" box is hidden when there is no subtitle. |

## Install (Chrome 150+)

1. Clone or download this repo to a permanent folder, e.g. `~/ChromeExtensions/bisub`.
2. Open `chrome://extensions` and turn on **Developer mode** (top right).
3. Click **Load unpacked** and select the folder.
4. Pin the BiSub icon in the toolbar.

Chrome shows a "developer mode extensions" notice at startup — that's normal for unpacked extensions.

## Usage

1. Open a video on a supported site (e.g. YouTube) and start it.
2. Click the BiSub icon.
3. **First Subtitle** → choose the original track (e.g. Chinese).
4. Tick **Use AI Translation** and pick the **target language** (e.g. English).
   - This mode keeps both lines perfectly in sync.
   - *Second Subtitle* (two separate tracks) also works, but the tracks have independent timing and won't line up.
5. Adjust font size, colours, stroke/shadow/background under **Subtitle Styles**.

The API Key field and "Verify you are not a bot" link are unused leftovers and do nothing.

## After a code change

`chrome://extensions` → click ↻ on BiSub → reload the video tab.

## Patch scripts

`tools/` holds the scripts used to build this version from the original package (in order: `1_private_translate.py`, `2_pinyin.py`, `3_linger.py`, after copying `background.js`, `dsx-pinyin.js`, `pinyin-pro.js`). Each asserts its target code exists exactly once, so it fails loudly on a different base version.

```bash
python3 -I tools/1_private_translate.py /path/to/base-copy
```

## Limitations

- `clients5.google.com` is an unofficial endpoint; it may get rate-limited or change. Fallback idea: a local model via Ollama.
- No auto-updates (unpacked extension).
- Pinyin is always on for Chinese lines (no toggle yet).

## Licences

- pinyin-pro: MIT, see `pinyin-pro.LICENSE`.
- Remaining third-party code: all rights reserved by its original authors — personal use only.
