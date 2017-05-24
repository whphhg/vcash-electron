# Vcash Electron GUI
:honeybee: Multi-platform and multi-node GUI for [Vcash](https://vcash.info/).
Latest releases can be found [here](https://github.com/whphhg/vcash-electron/releases).

![Screenshots](http://i.imgur.com/i3Dxol0.gif)

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
using `npm run dev` or `npm run dev-win` on Windows.

    $ npm run dev (Linux and macOS)
    $ npm run dev-win (Windows)

## Contribute translations
First follow the `Install from source` guide above. Then create a copy of the
`en-US` directory in `src/locales` and construct the first part of the directory
name by using the `ISO 639-1 Code`
[language code](https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes)
and the second part by using the `ISO 3166 Alpha-2 code`
[country code](https://en.wikipedia.org/wiki/ISO_3166-1#Current_codes). Delimit
the two with a dash `-`.

After you've created the correctly named translation directory, open
`src/stores/gui.js` and add the new translation to the
[languages](https://github.com/whphhg/vcash-electron/blob/master/src/stores/gui.js#L20-L24)
array (in alphabetical order).

    { language: 'languageCode-countryCode', name: 'New language' },

You can now select your new translation in the GUI and start translating the
strings in the `wallet.json`.

**Note:** Please use an editor that will open and save `wallet.json` in UTF-8
(e.g. [Atom](https://atom.io/)).

## Package and build
To bundle the daemon with the GUI, name it `vcashd-arch`, where `arch` can
be either `ia32` or `x64` and place it into the `bin` directory. This directory
is checked for the current platform & arch daemon executable on start-up by
[daemon.js](https://github.com/whphhg/vcash-electron/blob/master/src/daemon.js)
and is not included in the asar archive, but gets unpacked into
the `dist/platform-unpacked/app.asar.unpacked` directory due to
[this](https://electron.atom.io/docs/tutorial/application-packaging/#executing-binaries-inside-asar-archive)
asar limitation.

To only generate the `dist/platform-unpacked` package directory without
actually packaging the GUI run `npm run pack`.

    $ npm run pack

You can read more about the `electron-builder` options
[here](https://github.com/electron-userland/electron-builder/wiki/Options).

### Linux and Windows (using Docker)
The following dependencies are required to be installed:
* docker (make sure your user is in the docker group)

Run the docker container.

    $ docker run --rm -ti -v ${PWD}:/project -v ${PWD##*/}-node-modules:/project/node_modules -v ~/.electron:/root/.electron electronuserland/electron-builder:wine

To package in a distributable format run one of the scripts from the table
below, which will create the packages and save them into the `dist` directory.
Packages will be created according to the `build` and `scripts` options in
[package.json](https://github.com/whphhg/vcash-electron/blob/master/package.json#L11-L33).

    $ npm install && npm prune && npm run <script>

Script | Target arch | Description
------ | ------ | ------
dist-linux | x64 | Create 64-bit Linux .deb and .zip packages
dist-nsis | ia32 x64 | Create a Windows NSIS installer for both architectures
dist-win32-ia32 | ia32 | Create a 32-bit Windows portable executable
dist-win32-x64 | x64 | Create a 64-bit Windows portable executable

**Note:** If you are bundling daemons, `dist-nsis` script requires both
`vcashd-ia32.exe` and `vcashd-x64.exe` in the `bin` directory. Other scripts
require only the daemon for the target arch of the platform they're packaging for.

## Linux and macOS
To package in a distributable format run one of the scripts from the table
below, which will create the packages for your current platform and save
them into the `dist` directory. Packages will be created according to the
`build` and `scripts` options in
[package.json](https://github.com/whphhg/vcash-electron/blob/master/package.json#L11-L33).

    $ npm run <script>

Script | Target arch | Description
------ | ------ | ------
dist-linux | x64 | Create 64-bit Linux .deb and .zip packages
dist-mac | x64 | Create 64-bit macOS .dmg package

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
