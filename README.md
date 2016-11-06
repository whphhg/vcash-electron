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
- Implement wallet backup. __TODO__ [src/components/Maintenance.js](src/components/Maintenance.js)
- Implement wallet check and repair. __TODO__ [src/components/Maintenance.js](src/components/Maintenance.js)
- Implement wallet passphrase change. __TODO__ [src/components/Maintenance.js](src/components/Maintenance.js)
- Staking indicator if config pos:1 & unlocked (gavel, flag, flash on, rowing). __TODO__ [src/components/Root.js](src/components/Root.js)
- Remote RPC using tunnel-ssh -> ssh -L9195:localhost:9195 user@ip). __TODO__ [src/components/RpcManager.js](src/components/RpcManager.js)
- Complete rewrite. Fail. __TODO__ [src/components/Transaction.js](src/components/Transaction.js)
- Implement custom balance tracking. __TODO__ [src/stores/transactions.js](src/stores/transactions.js)



#### Tips are appreciated! :sparkles:
```
XVC: Vsaj7MMLwSMgzBQEonfMLR9QxqkKprFVGR
BTC: 1Pay4nywPa1qkP5no3rcrLhfVo6Bc1JE8s
```
