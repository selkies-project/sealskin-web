<h1 align="center">SealSkin Website</h1>

<p align="center">Part of <a href="https://www.linuxserver.io"><img src="https://raw.githubusercontent.com/selkies-project/sealskin-web/main/img/linuxserver.svg" alt="LinuxServer.io" title="LinuxServer.io" width="32" height="32" align="middle"></a></p>

[![Pages](https://github.com/selkies-project/sealskin-web/actions/workflows/pages.yml/badge.svg)](https://github.com/selkies-project/sealskin-web/actions/workflows/pages.yml) [![License: MPL 2.0](https://img.shields.io/badge/License-MPL%202.0-brightgreen.svg)](https://opensource.org/licenses/MPL-2.0) [![Discord](https://img.shields.io/discord/354974912613449730?logo=discord&label=Discord)](https://discord.com/invite/linuxserver) [![Ask DeepWiki](https://img.shields.io/badge/Ask-DeepWiki-blue)](https://deepwiki.com/selkies-project/sealskin-web)

The landing page for [SealSkin](https://github.com/selkies-project/sealskin), served at
[sealskin.app](https://sealskin.app/). The documentation lives separately at
[docs.sealskin.app](https://docs.sealskin.app/).

It is a static site: no framework, no build step.

## Files

| File | Purpose |
| --- | --- |
| `index.html` | The page: what SealSkin does, how to get it, the catalog, how it works, and where to find the project. |
| `index.css` | Styling for the dark and light themes, and the CSS animations. |
| `index.js` | The app marquee, the hero backdrop, the install tabs, the copy buttons, and the screenshot lightbox. |
| `theme.js` | The light, dark, or system theme the header's switch picks, applied before the first paint. |
| `apps.js` | The applications the marquee shows, generated from the catalog (see below). |
| `scripts/sync-apps.py` | Rebuilds `apps.js` from `apps.yml` in [linuxserver/sealskin-apps](https://github.com/linuxserver/sealskin-apps). |
| `img/` | The logo (`logo.svg`, the same file as the project's), the icons made from it, the client logos, the social card, and the pictures the page shows. |

## Refresh the application list

```bash
python3 scripts/sync-apps.py                      # fetches apps.yml from GitHub
python3 scripts/sync-apps.py ../sealskin-apps/apps.yml   # or from a local checkout
```

The script needs PyYAML. It folds the Webtop desktop variants into one entry per
distribution and sorts the rest by name; the page rounds the count it shows down to a
multiple of ten, so a few additions never make the number wrong.

## Preview locally

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000. Any static file server works.

## Deploy

Pushes to `main` run the [GitHub Pages workflow](.github/workflows/pages.yml), which publishes
the repository as it is. The custom domain is a repository setting.
