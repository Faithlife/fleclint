# fleclint

`fleclint` is a tool for enforcing EditorConfig settings in a directory tree. It is a wrapper around [`eclint`](https://github.com/jedmao/eclint/) that adds support for ignoring files/folders with an `.ecignore` file (which contains globs like a `.gitignore` file).

## Platforms

* Windows : Tested
  * Requires x64 install of Git for Windows
* Mac : Untested
* Linux : Untested

## Usage

`node fleclint.js <directory (optional)>`

* `<directory>` : the directory to enforce EditorConfig settings in. If not provided, `fleclint` uses the current working directory.
