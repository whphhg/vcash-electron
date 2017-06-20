# Vcash Electron GUI

[![Release](https://img.shields.io/github/release/openvcash/vcash-electron.svg)](https://github.com/openvcash/vcash-electron/releases)
[![Styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg)](https://github.com/prettier/prettier)
[![Standard style guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

:honeybee: Multi-platform and multi-node GUI for [Vcash](https://vcash.info/),
a decentralized currency for the internet. Latest release can be found
[here](https://github.com/openvcash/vcash-electron/releases).

![Screenshots](http://i.imgur.com/i3Dxol0.gif)

## Table of Contents
- [Install from source](#install-from-source)
- [Build and package](#build-and-package)
  * [Package for Linux](#package-for-linux)
  * [Package for macOS](#package-for-macos)
  * [Package for Windows (using Docker)](#package-for-windows-using-docker)
- [Contributing](#contributing)
- [License](#license)

--------------------------------------------------------------------------------

## Install from source
Make sure you have installed `git` and the latest version of
[Node.js](https://nodejs.org/en/download/current/). Then clone this repository
using `git clone`, move to the cloned directory using `cd vcash-electron/` and
install Node.js dependencies using `npm install`.

    git clone https://github.com/openvcash/vcash-electron.git
    cd vcash-electron/
    npm install

You can run the GUI using `npm run gui` after the dependency installation
is completed.

    npm run gui

Alternatively, if you want to use development tools, run the GUI
using `npm run dev` or `npm run dev-win` on Windows.

    npm run dev (Linux and macOS)
    npm run dev-win (Windows)

## Build and package
[Download](https://vcash.info/wallets.php) the latest daemon for your platform
to the `bin/` directory and rename it to either `vcashd-ia32` or `vcashd-x64`,
depending on the arch. The `bin/` directory gets bundled with the GUI when you
run any of the `npm run dist-*` scripts and is checked on start-up by
[daemon.js](https://github.com/openvcash/vcash-electron/blob/master/src/daemon.js)
which launches the daemon if it matches the correct platform and arch.

Packages are created according to the `build` and `scripts` options in
[package.json](https://github.com/openvcash/vcash-electron/blob/master/package.json#L13-L36),
about which you can read more
[here](https://github.com/electron-userland/electron-builder/wiki/Options).

### Package for Linux
Run the command below (on Linux) to create and save 64-bit .deb and .zip
packages into the `dist/` directory.

    npm install && npm prune && npm run dist-linux

**Note:** The command above can also be run inside the docker container to
create Linux packages on Windows. You can read more about packaging using
docker in the
[Package for Windows (using Docker)](#package-for-windows-using-docker)
section below.

### Package for macOS
Run the command below (on macOS) to create and save 64-bit .dmg
package into the `dist/` directory.

    npm install && npm prune && npm run dist-macos

### Package for Windows (using Docker)
Make sure you have installed `docker` and that your user is in the docker
group. You can run the docker container either on Linux or Windows.

```
docker run --rm -ti -v ${PWD}:/project -v ${PWD##*/}-node-modules:/project/node_modules -v ~/.electron:/root/.electron electronuserland/electron-builder:wine
```

Next, run any of the scripts from the table below to create and save 64-bit and
32-bit packages into the `dist/` directory.

Script | Description
------ | ------
dist-win-nsis | Create a Windows NSIS installer for both architectures
dist-win-ia32 | Create a 32-bit Windows portable executable
dist-win-x64 | Create a 64-bit Windows portable executable

    npm install && npm prune && npm run <script>

**Note:** `dist-win-nsis` script requires both `vcashd-ia32.exe` and
`vcashd-x64.exe` in the `bin/` directory.

## Contributing
Thank you for taking the time to help and improve the GUI! Please read the
[contributing guide](https://github.com/openvcash/vcash-electron/.github/CONTRIBUTING.md).

## License
This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.
