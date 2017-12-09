# Vcash Electron GUI
[![Release](https://img.shields.io/github/release/openvcash/vcash-electron.svg)](https://github.com/openvcash/vcash-electron/releases)
[![Styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg)](https://github.com/prettier/prettier)
[![Standard style guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

Multi-platform and multi-node GUI for [Vcash](https://vcash.info/). You can find
the latest release [here](https://github.com/openvcash/vcash-electron/releases).

![Screenshots](http://i.imgur.com/i3Dxol0.gif)

## Table of Contents
- [Install from source](#install-from-source)
- [Build and package for Linux, macOS and Windows](#build-and-package-for-linux-macos-and-windows)
- [Contributing](#contributing)
- [License](#license)

--------------------------------------------------------------------------------

## Install from source
Make sure you have installed `git` and the latest version of
[Node.js](https://nodejs.org/en/download/current/), then clone this repository
using `git clone`, move to the cloned directory using `cd vcash-electron/` and
install Node.js dependencies using `npm install`.

    git clone https://github.com/openvcash/vcash-electron.git
    cd vcash-electron/
    npm install

After the dependency installation is completed, transform the source code using
`npm run babel` or `npm run babel-watch` to keep auto-transforming on any
changes to the files in the `src/` directory.

    npm run babel (transform once)
    npm run babel-watch (auto-transform on changes)

You can now run the GUI using `npm run gui`, or if you want to use development
tools, using `npm run dev` or `npm run dev-win` on Windows.

    npm run gui
    npm run dev (Linux and macOS)
    npm run dev-win (Windows)

## Build and package for Linux, macOS and Windows
[Download](https://vcash.info/) the latest daemon for your platform
to the `build/bin/` directory and rename it to either `vcashd-ia32` or
`vcashd-x64`, depending on the arch. The `build/bin/` directory gets bundled
with the GUI when you run any of the `npm run build-*` scripts, and is
checked on start-up by
[daemon.js](https://github.com/openvcash/vcash-electron/blob/master/src/stores/daemon.js)
which launches the daemon if it matches the correct platform and arch.

Packages are created according to the
[.buildrc](https://github.com/openvcash/vcash-electron/blob/master/.buildrc)
config and `scripts` options in
[package.json](https://github.com/openvcash/vcash-electron/blob/master/package.json#L18-L23),
about which you can read more
[here](https://www.electron.build/configuration/configuration).

Run the commands below to install npm dependencies, remove extraneous npm
packages and transform the source code to `lib/` directory using `Babel`.

    npm install && npm prune && npm run babel

You can now create and save packages into the `dist/` directory by running the
scripts (for your platform) from the table below.

Script         | Description
-------------- | ---------------------------------------------------------------
build-linux    | Create 64-bit .deb and .zip packages
build-macos    | Create a 64-bit .dmg package
build-win-nsis | Create a Windows NSIS installer for both architectures
build-win-ia32 | Create a 32-bit Windows portable executable
build-win-x64  | Create a 64-bit Windows portable executable

    npm run <script>

**Note:** `build-win-nsis` script requires both `vcashd-ia32.exe` and
`vcashd-x64.exe` in the `build/bin/` directory.

## Contributing
Thank you for taking the time to help and improve the GUI! Please read the
[contributing guide](https://github.com/openvcash/vcash-electron/blob/master/.github/CONTRIBUTING.md).

## License
This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.
