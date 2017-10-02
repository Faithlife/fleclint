const { spawn } = require('child_process')
const fs = require('fs')

// Checks that the given directory (and its subfolders and files) matches its editorconfig
function checkEditorConfig (directory) {
  const gitBashPath = 'C:/Program Files/Git/bin/sh.exe'

  // ensure Git Bash is installed on Windows
  if (process.platform === 'win32' && !fs.existsSync(gitBashPath)) {
    console.error(`When running on Windows, Git Bash is required (expected location: ${gitBashPath}).`)
    process.exit(-1)
  }

  if (process.cwd() !== directory) {
    process.chdir(directory)
  }

  // load .ecignore file if it exists
  let eclintArgs = ' *'
  try {
    const ecignore = fs.readFileSync('.ecignore')
    console.log('Loading .ecignore ...')

    for (const line of ecignore.toString().split('\n').map((line) => line.trim()).filter((line) => line.length > 0)) {
      eclintArgs += ` '!${line}'`
    }
  } catch (error) {
    // ignore when the file doesn't exist or we fail to read it successfully
  }

  // construct Unix-style path to eclint.js that will work on Unix and in Git Bash on Windows
  //
  // we expect this script to be run from within node_modules so it references eclint from
  // its sibling node_modules folder
  const eclintPath = (() => {
    const npmPackagePath = `${__dirname}/../../eclint/bin/eclint.js`.replace(/\\/g, '/')
    if (fs.existsSync(npmPackagePath)) {
      return npmPackagePath
    }

    const localDevPath = `${__dirname}/node_modules/eclint/bin/eclint.js`.replace(/\\/g, '/')
    if (fs.existsSync(localDevPath)) {
      return localDevPath
    }

    console.error(`'eclint' is required but was not found in either of the expected locations ('${npmPackagePath}' or '${localDevPath}')`)
    process.exit(-1)
  })()

  const command = process.platform === 'win32'
    ? `"${gitBashPath}"`
    : 'node'

  const args = process.platform === 'win32'
    ? [ '"-c"', `"node ${eclintPath} check${eclintArgs}"` ]
    : [ `"${eclintPath}"`, `check${eclintArgs}` ]

  console.log(`Running eclint lint command:\n'${command} ${args.join(' ')}`)
  const eclintProcess = spawn(command, args, { shell: true })

  eclintProcess.stdout.on('data', (data) => {
    console.log(`${data}`)
  })

  eclintProcess.stderr.on('data', (data) => {
    console.error(`${data}`)
  })

  eclintProcess.on('error', (error) => {
    console.error(`${error}`)
  })

  eclintProcess.on('close', (code) => {
    console.log(code === 0 ? 'SUCCESS.' : 'FAILED.')
    process.exit(code)
  })
}

const args = process.argv.slice(2)
if (args.length > 1) {
  console.error.log('Usage: node fleclint.js <directory (optional: uses current directory if not provided)>')
}

console.log('Running fleclint ...')

const directory = args.length === 1 ? args[0] : process.cwd()
checkEditorConfig(directory)
