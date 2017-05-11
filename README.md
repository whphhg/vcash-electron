# Vcash Electron GUI
Multi-platform and multi-node GUI for [Vcash](https://vcash.info/). Latest
releases can be found [here](https://github.com/whphhg/vcash-electron/releases).

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
using `npm run dev`, or `npm run dev-win` if you are on Windows.

    $ npm run dev (Linux and macOS)
    $ npm run dev-win (Windows)

## Package and build
`electron-builder` is used to package and build the application, you can
read all about it [here](https://github.com/electron-userland/electron-builder).


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
