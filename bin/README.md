# Launch the Vcash daemon on GUI start-up
Placing a daemon named `vcashd-ia32` or `vcashd-x64` into this directory will
launch it on GUI start-up if it matches the correct platform and arch. It will
also get bundled with the GUI if you run any of the `npm run dist-*` scripts.
