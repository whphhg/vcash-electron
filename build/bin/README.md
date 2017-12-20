# Launch the daemon on startup
[Download](https://vcash.info/) the latest daemon for your platform
to this directory and rename it to `vcashd-ia32` or `vcashd-x64`, depending on
your arch. This directory gets bundled with the GUI when you run any of the
`npm run build-*` scripts and is checked on startup by
[daemon.js](https://github.com/openvcash/vcash-electron/blob/master/src/stores/daemon.js)
which launches the daemon if it matches the correct platform and arch.
