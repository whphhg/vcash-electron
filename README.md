## Vcash Electron UI
This is a UI for [Vcash](https://vcash.info/), a decentralized currency for the internet. The UI communicates with the Vcash daemon using RPC and is available for Linux, OS X and Windows.

:hatching_chick: **Warning**: This is beta software that is being actively developed.

![Screenshots](http://i.imgur.com/zfjel56.gif)


### Installing and updating
The following dependencies are required to be installed:
* latest version of [Vcash](https://vcash.info/wallets.php) (either GUI or daemon)
* latest version of [Node.js](https://nodejs.org/en/download/current/) ([Ubuntu users](https://nodejs.org/en/download/package-manager/#debian-and-ubuntu-based-linux-distributions))
* git (if cloning)

To install:

    $ git clone https://github.com/whphhg/vcash-electron.git OR download zip
    $ cd vcash-electron
    $ npm install

To run (make sure to launch Vcash before):

    $ npm run ui

To run with DevTools enabled:

    $ npm run dev (Linux and OS X)
    $ npm run dev-win (Windows)

To update:

    $ git pull OR download zip


[![Standard - JavaScript Style Guide](https://cdn.rawgit.com/feross/standard/master/badge.svg)](https://github.com/feross/standard)
