# Contributing
:deciduous_tree: Thank you for taking the time to help and improve the GUI!

If you've noticed a bug or have a question, search the
[issue tracker](https://github.com/openvcash/vcash-electron/issues) to see if
someone else in the community has already submitted an issue. If not, go ahead
and [submit one](https://github.com/openvcash/vcash-electron/issues/new)! If
it's something you think you can fix, improve or implement by yourself, then
[fork](https://help.github.com/articles/fork-a-repo) the repository and create
a branch with a descriptive name that includes the issue number (e.g. #233).

    git checkout -b 233-add-chinese-translations

Next, install [Node.js](https://nodejs.org/en/download/current/) dependencies
in the local clone of your fork using `npm install`. After the dependency
installation is completed, start `npm run babel-watch` to auto-transform the
source code on any changes to the files in the `src/` directory.

    npm install
    npm run babel-watch

You can now run the GUI using `npm start`. Depending on the size of your
changes you might also require development tools which are enabled when using
`npm run dev` or `npm run dev-win` on Windows.

    npm start
    npm run dev (Linux and macOS)
    npm run dev-win (Windows)

Then [download](https://vcash.info) and launch the latest daemon, or skip this
step if you've already got a daemon or GUI bundled with a daemon running.
This ensures the wallet will keep running while you restart the GUI to look at
the changes you've made.

You're now ready to implement your fix or feature. Make sure that your code
lints by using `npm run lint` and to format it using `npm run format` before
creating the pull request.

    npm run lint
    npm run format

### Code style
This repository uses [prettier](https://github.com/prettier/prettier) and
[standard](https://standardjs.com/) to maintain code style and consistency,
and to avoid bike-shedding.

### Add new translation
Follow and complete the steps above, then create a copy of the `en-US/`
directory in `src/locales/` and construct the first part of the copied
directory name by using the `ISO 639-1 Code`
[language code](https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes)
and the second part by using the `ISO 3166 Alpha-2 code`
[country code](https://en.wikipedia.org/wiki/ISO_3166-1#Current_codes).
Delimit the two parts with a dash `-`.

The final step is to open `src/stores/gui.js` and add your translation to the
[languages](https://github.com/openvcash/vcash-electron/blob/master/src/stores/gui.js#L20-L25)
array. Please add it in alphabetical order (by name) and use 6 spaces to indent
the line.

    { language: 'languageCode-countryCode', name: 'Language' },

You can now select your translation in the GUI and begin translating the
strings in `common.json`.

**Note:** Please use an editor that will open and save files in UTF-8
(e.g. [Atom](https://atom.io/)).

### Create a pull request
You should now switch back to your master branch and make sure it's up-to-date
with the upstream master branch.

    git remote add upstream git@github.com:openvcash/vcash-electron.git
    git checkout master
    git pull upstream master

Then update your feature branch from your local copy of master, and push it.

    git checkout 233-add-chinese-translations
    git rebase master
    git push --set-upstream origin 233-add-chinese-translations

Finally, go to [GitHub](https://github.com/openvcash/vcash-electron) and create
a [pull request](https://help.github.com/articles/creating-a-pull-request).
