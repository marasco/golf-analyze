# <a href='https://analyze.golf'><img src='https://analyze.golf/logo.png' height='40' alt='Analyze.Golf logo' aria-label='analyze.golf' /></a>

A browser based golf swing analyzer built with Vite, React, Redux, Tailwind and Konva.js.

Video playback is completely client side - there is no video uploading or server side integration required. Swing lines are drawn using canvas with the help of Konva.js.

## Motivation
There are lots of swing analyzer apps available for IOS and Android, but none on the web. My goal is to try to see how close a browser implementation can get to a native app. 

## Features 
- 📱 PWA with auto updates
- 📶 Offline support
- 🔄 Flip swing video
- 🖌 Draw swing lines
- 🏎 Blazing fast (~100kb JS, ~3kb CSS)
- 💻 Fully client side, no video upload or server integration

## Roadmap

- [x] Light/dark mode 
- [x] Update to Vite
- [x] PWA
- [x] Offline support
- [ ] Testing with Vitest
- [ ] Improve home design
- [ ] Accessibility improvements
- [ ] Compare multiple swings
  - [ ] Allow selecting of multiple user videos
  - [ ] Add library of swing videos of professionals to compare against 
- [ ] Persist video locally (maybe not possible)


