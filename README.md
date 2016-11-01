## Vcash Electron UI
This is a **unofficial** UI for Vcash, a decentralized currency for the internet. The UI communicates with vcashd using RPC and is available for Linux, OS X and Windows.

:hatching_chick: **Warning**: This is beta software that is being actively developed. Any testing is welcome!

![Screenshots](http://i.imgur.com/zfjel56.gif)


### Starting and updating
Right now there are no pre-built binaries, so you have to follow the steps below to install. I will be adding the binaries as soon as I'm done experimenting with the packager.

User data is safely stored in Electron's local storage, depending on the operating system:
- Linux `~/.config/vcash-electron`
- OS X `~/Library/Application Support/vcash-electron`
- Windows `%APPDATA%\vcash-electron`


### Installing and updating from source
The following dependencies are required to be installed:
* current [Node.js](https://nodejs.org/en/download/current/) version ([Ubuntu users](https://nodejs.org/en/download/package-manager/#debian-and-ubuntu-based-linux-distributions))
* current [Vcash](https://v.cash/wallets.php) version (either GUI or daemon)
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

Running the UI inside of a Linux VirtualBox guest might cause the window to be black. To fix this, open `package.json`, add `--disable-gpu` after `electron .` and run again.


### IDEAs, NOTEs, TODOs and FIXMEs
- Colorize amounts according to category. __TODO__ [src/components/Transactions.js](src/components/Transactions.js)
- Implement right-click copy and paste menu. __TODO__ [src/index.js](src/index.js)
- Implement wallet backup. __TODO__ [src/index.js](src/index.js)
- Implement wallet check. __TODO__ [src/index.js](src/index.js)
- Implement wallet passphrase change. __TODO__ [src/index.js](src/index.js)
- Implement wallet repair. __TODO__ [src/index.js](src/index.js)
- Remote RPC using tunnel-ssh -> ssh -L9195:localhost:9195 user@ip). __TODO__ [src/index.js](src/index.js)
- Staking indicator if config pos:1 & unlocked (gavel, flag, flash on, rowing). __TODO__ [src/index.js](src/index.js)
- Translations (i18next, react-i18next, moment-timezone). __TODO__ [src/index.js](src/index.js)
- Handle error_code_wallet_keypool_ran_out. __TODO__ [src/stores/addressNew.js](src/stores/addressNew.js)
- Transaction dialog not complete, needs overhaul, fails opening if PoS. __FIXME__ [src/stores/transaction.js](src/stores/transaction.js)
- Combine self-sends and correctly handle category names, similar to WebUI. __TODO__ [src/stores/transactions.js](src/stores/transactions.js)
- Implement balance tracking of individual addresses and accounts. __TODO__ [src/stores/transactions.js](src/stores/transactions.js)



#### Tips are appreciated! :sparkles:
```
XVC: Vsaj7MMLwSMgzBQEonfMLR9QxqkKprFVGR
BTC: 1Pay4nywPa1qkP5no3rcrLhfVo6Bc1JE8s
```
