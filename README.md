# Vcash Electron GUI
:honeybee: Multi-platform and multi-node GUI for [Vcash](https://vcash.info/).
Latest releases can be found [here](https://github.com/whphhg/vcash-electron/releases).

![Screenshots](http://i.imgur.com/OBt1iOA.gif)

## Install from source
The following dependencies are required to be installed:
* latest version of [Vcash](https://vcash.info/wallets.php)
* latest version of [Node.js](https://nodejs.org/en/download/current/)
* git

Clone this repository using `git clone`, move to the cloned directory
using `cd vcash-electron` and install Node.js dependencies using `npm install`.

    $ git clone https://github.com/whphhg/vcash-electron.git
    $ cd vcash-electron
    $ npm install

After it is done installing dependencies, you can run the GUI
using `npm run gui`.

    $ npm run gui

Alternatively, if you want to use development tools, run the GUI
using `npm run dev`, or `npm run dev-win` on Windows.

    $ npm run dev (Linux and macOS)
    $ npm run dev-win (Windows)

## Package and build
To bundle the daemon with the GUI, name it `vcashd` and
place it into the `bin` directory. This directory is checked for
the current platform daemon executable on start-up by
[daemon.js](https://github.com/whphhg/vcash-electron/blob/master/src/daemon.js)
and is not included in the asar archive, but gets unpacked into
the `dist/platform-unpacked/app.asar.unpacked` directory due to this
[asar limitation](https://electron.atom.io/docs/tutorial/application-packaging/#executing-binaries-inside-asar-archive).

To only generate the `dist/platform-unpacked` package directory without
actually packaging the GUI, which is useful for testing, run `npm run pack`.

    $ npm run pack

To package in a distributable format run `npm run dist`, which will create
the packages for your current platform and save them into the `dist` directory.
Packages will be created according to the `build` options in
[package.json](https://github.com/whphhg/vcash-electron/blob/master/package.json#L14-L36).

    $ npm run dist

You can read more about the `electron-builder` options
[here](https://github.com/electron-userland/electron-builder/wiki/Options).

## License
This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

[![Standard - JavaScript Style Guide](https://cdn.rawgit.com/feross/standard/master/badge.svg)](https://github.com/feross/standard)
