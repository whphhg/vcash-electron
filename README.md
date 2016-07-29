# Vcash Electron GUI

![Screenshots](http://i.imgur.com/zfjel56.gif)

This is a (**unofficial**) GUI that communicates with vcashd using RPC. It runs on Linux, OS X and Windows.

:hatching_chick: **Warning**: This is beta software that is being actively developed. However, it is mature enough to be played with and any testing is welcome!


## Starting and updating

Right now there are no pre-built binaries, so you have to follow the steps below to install. I will be adding the binaries as soon as I'm done experimenting with the packager.

User data is safely stored in Electron's local storage, depending on the operating system:
- Linux `~/.config/vcash-electron`
- OS X `~/Library/Application Support/vcash-electron`
- Windows `%APPDATA%\vcash-electron`


## Installing and updating from source

The following dependencies are required to be installed:
* current [Node.js](https://nodejs.org/en/download/current/) version
* current [Vcash](https://v.cash/wallets.php) version (either GUI or daemon)
* git (if cloning)

To install:

    $ git clone https://github.com/whphhg/vcash-electron.git OR download zip
    $ cd vcash-electron
    $ npm install

To run (make sure to launch Vcash before):

    $ npm run app

To run with DevTools enabled:

    $ npm run dev (Linux and OS X)
    $ npm run dev-win (Windows)

To update:

    $ cd vcash-electron
    $ git pull OR download zip

:exclamation: Running the GUI inside of a Linux VirtualBox guest might cause the window to be black. To fix this, open `package.json`, add `--disable-gpu` after `electron .` and try again.

## IDEAs, NOTEs, TODOs and FIXMEs

- Show icons if vote candidate & staking (config.dat pos:1 & unlocked). __TODO__ [application/components/Header.js](application/components/Header.js)
- Colorize amounts according to category. __TODO__ [application/components/Transactions.js](application/components/Transactions.js)
- Switch table to FixedDataTable (performance). __TODO__ [application/components/Transactions.js](application/components/Transactions.js)
- Contacts with VCF import/export support (node-vcf). __IDEA__ [application/index.js](application/index.js)
- Guided tour (react-joyride). __IDEA__ [application/index.js](application/index.js)
- Implement key dump. __TODO__ [application/index.js](application/index.js)
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
- RPC getbalance incorrect IF using RPC sendtoaddress. Ok if only RPC sendmany is used on a fresh wallet. __NOTE__ [application/stores/transactions.js](application/stores/transactions.js)
- Allow selecting the daemon you're getting data from, local or remote (tunnel-ssh). __TODO__ [application/utilities/rpc.js](application/utilities/rpc.js)

<br />
Below are my tipping jars, in case you're feeling generous and want to send a few coins my way. :wink:

```
XVC: Vsaj7MMLwSMgzBQEonfMLR9QxqkKprFVGR
BTC: 1Pay4nywPa1qkP5no3rcrLhfVo6Bc1JE8s
```
