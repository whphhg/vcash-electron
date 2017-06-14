# Launch the daemon on start-up
[Download](https://vcash.info/wallets.php) the latest daemon for your platform
to this directory and rename it to either `vcashd-ia32` or `vcashd-x64`,
depending on your arch. This directory gets bundled with the GUI when you run
any of the `npm run dist-*` scripts and is checked on start-up by
[daemon.js](https://github.com/openvcash/vcash-electron/blob/master/src/daemon.js)
which launches the daemon if it matches the correct platform and arch.
