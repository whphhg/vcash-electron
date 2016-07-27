# Electron UI for the Vcash crypto currency

This is a (**unofficial**) tool that communicates with vcashd using RPC.

It runs on Linux, OS X and Windows.

**Warning**: This is a work in progress, but it's mature enough to be tested by anyone who's interested. Complete list of TODOs and FIXMEs is at the bottom.

## Requirements

* current [Node.js](https://nodejs.org/en/download/current/) version
* running the latest version of [Vcash](https://v.cash/wallets.php) (either GUI or daemon)

## Installation and usage

Currently, there are no pre-built binaries. I will be adding them as soon as I'm done experimenting with the packager in the next couple of days.

To install:

    $ git clone https://github.com/whphhg/vcash-electron.git
    $ cd vcash-electron
    $ npm install

To run:

    $ npm run app

To run with DevTools enabled:

    $ npm run dev (Linux and OS X)
    $ npm run dev-win (Windows)

## Updating

To update:

    $ cd vcash-electron
    $ git pull

After I add pre-built binaries, updating will be done by downloading and overwriting the existing binary. User data is safely stored in Electron's localStorage, so you can't accidentally overwrite or delete it.

Depending on the operating system, user data is stored in:
- Linux `~/.config/vcash-electron`
- OS X `~/Library/Application Support/vcash-electron`
- Windows `%APPDATA%\vcash-electron`

## Running inside a Linux VirtualBox guest

If the Electron window is black, open `package.json`, add `--disable-gpu` after `electron .` and try again.

## TODOs and FIXMEs

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

## Screenshots

![Transactions](http://i.imgur.com/F4LqzRg.png)
![Address book](http://i.imgur.com/IzC89TE.png)
![Send](http://i.imgur.com/BmItZ1t.png)
![Network information](http://i.imgur.com/blfJXfD.png)
![Block reward calculator](http://i.imgur.com/x3ziJQO.png)

Donations are welcome at
```
XVC: Vsaj7MMLwSMgzBQEonfMLR9QxqkKprFVGR
BTC: 1Pay4nywPa1qkP5no3rcrLhfVo6Bc1JE8s
```
