# fleclint

`fleclint` is a tool for enforcing EditorConfig settings in a directory tree. It is a wrapper around [`eclint`](https://github.com/jedmao/eclint/) that adds support for ignoring files/folders with an `.ecignore` file (which contains globs like a `.gitignore` file).

## Platforms

* Windows : Tested
  * Requires `bash.exe` to be in the `PATH` (e.g. install 64-bit Git and add `C:\Program Files\Git\bin` to the `PATH`)
* Mac : Untested
* Linux : Untested

## Usage

`node fleclint.js <action> <directory (optional)>`

* `<action>` : the action to perform; this can be one of the following
  * `check` : check all files in the given directory tree against its EditorConfig
  * `fix` : fixes all files in the given directory tree that do not match its EditorConfig
* `<directory>` : the directory to enforce EditorConfig settings in. If not provided, `fleclint` uses the current working directory.

## License

`fleclint` is licensed under the [MIT License](LICENSE.md).
