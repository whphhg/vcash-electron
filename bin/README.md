# Daemons
Placing a daemon named `vcashd-arch`, where `arch` can be either
`ia32` or `x64` into this directory will spawn it on start-up if it matches
the correct platform and arch. It will also get bundled with the GUI when
you run any of the `npm run dist-` scripts.
