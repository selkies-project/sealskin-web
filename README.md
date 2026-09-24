# SealSkin Website

[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/selkies-project/sealskin-web)

The landing page for [SealSkin](https://github.com/selkies-project/sealskin), served at
[sealskin.app](https://sealskin.app/). The documentation lives separately at
[docs.sealskin.app](https://docs.sealskin.app/).

It is a static site: no framework, no build step.

## Files

| File | Purpose |
| --- | --- |
| `index.html` | The page, with links out to the clients, the server, the docs, and the community. |
| `index.css` | Styling and the CSS animations. |
| `index.js` | The app marquee, the hero animation, the copy buttons, and the screenshot lightbox. |
| `apps.js` | The list of LinuxServer.io application containers shown in the marquee. |
| `img/` | Logos, screenshots, and the demo video. |

## Preview locally

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000. Any static file server works.

## Deploy

Pushes to `main` run the [GitHub Pages workflow](.github/workflows/pages.yml), which publishes
the repository as it is. The custom domain is a repository setting.
