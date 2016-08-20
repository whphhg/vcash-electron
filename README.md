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

    $ cd vcash-electron
    $ git pull OR download zip

Running the UI inside of a Linux VirtualBox guest might cause the window to be black. To fix this, open `package.json`, add `--disable-gpu` after `electron .` and try again.


### IDEAs, NOTEs, TODOs and FIXMEs
- Show icons if vote candidate & staking (config.dat pos:1 & unlocked). __TODO__ [application/components/Application.js](application/components/Application.js)
- Colorize amounts according to category. __TODO__ [application/components/Transactions.js](application/components/Transactions.js)
- Contacts with VCF import/export support (node-vcf). __IDEA__ [application/index.js](application/index.js)
- Guided tour (react-joyride). __IDEA__ [application/index.js](application/index.js)
- Implement right-click copy and paste menu. __TODO__ [application/index.js](application/index.js)
- Implement translations (i18next, react-i18next, moment-timezone). __TODO__ [application/index.js](application/index.js)
- Implement wallet backup. __TODO__ [application/index.js](application/index.js)
- Implement wallet check. __TODO__ [application/index.js](application/index.js)
- Implement wallet dump. __TODO__ [application/index.js](application/index.js)
- Implement wallet passphrase change. __TODO__ [application/index.js](application/index.js)
- Implement wallet repair. __TODO__ [application/index.js](application/index.js)
- Handle error_code_wallet_keypool_ran_out. __TODO__ [application/stores/addressNew.js](application/stores/addressNew.js)
- Transaction dialog not complete, needs overhaul, fails opening if PoS. __FIXME__ [application/stores/transaction.js](application/stores/transaction.js)
- Combine self-sends and correctly handle category names, similar to WebUI. __TODO__ [application/stores/transactions.js](application/stores/transactions.js)
- Implement balance tracking of individual addresses and accounts. __TODO__ [application/stores/transactions.js](application/stores/transactions.js)
- Allow selecting the daemon you're getting data from, local or remote (tunnel-ssh). __TODO__ [application/utilities/rpc.js](application/utilities/rpc.js)


#### Tips are appreciated! :sparkles:
```
XVC: Vsaj7MMLwSMgzBQEonfMLR9QxqkKprFVGR
BTC: 1Pay4nywPa1qkP5no3rcrLhfVo6Bc1JE8s
```
