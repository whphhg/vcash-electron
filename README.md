## Vcash Electron UI
This is a **unofficial** UI for Vcash, a decentralized currency for the internet. The UI communicates with vcashd using RPC and is available for Linux, OS X and Windows.

:hatching_chick: **Warning**: This is beta software that is being actively developed.

![Screenshots](http://i.imgur.com/zfjel56.gif)


### Installing and updating
The following dependencies are required to be installed:
* latest version of [Node.js](https://nodejs.org/en/download/current/) ([Ubuntu users](https://nodejs.org/en/download/package-manager/#debian-and-ubuntu-based-linux-distributions))
* latest version of [Vcash](https://v.cash/wallets.php) (either GUI or daemon)
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


### TODOs
- Implement wallet check and repair. __TODO__ [src/components/Maintenance.js](src/components/Maintenance.js)
- Staking indicator if config pos:1 & unlocked (gavel, loyalty, flag, flash on, rowing). __TODO__ [src/components/Root.js](src/components/Root.js)
- Remote RPC using tunnel-ssh -> ssh -L9195:localhost:9195 user@ip). __TODO__ [src/components/RpcManager.js](src/components/RpcManager.js)
- Complete rewrite. Fail. __TODO__ [src/components/Transaction.js](src/components/Transaction.js)
- Implement custom balance tracking. __TODO__ [src/stores/transactions.js](src/stores/transactions.js)


#### Tips are appreciated! :sparkles:
```
XVC: Vsaj7MMLwSMgzBQEonfMLR9QxqkKprFVGR
BTC: 1Pay4nywPa1qkP5no3rcrLhfVo6Bc1JE8s
```


[![JavaScript Style Guide](https://cdn.rawgit.com/feross/standard/master/badge.svg)](https://github.com/feross/standard)
