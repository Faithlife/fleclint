const { spawn } = require('child_process')
const fs = require('fs')

// Checks that the given directory (and its subfolders and files) matches its editorconfig
// or fixes all files within the given directory tree to match its editorconfig
function enforceEditorConfig (action, directory) {
  const gitBashPath = 'bash.exe';

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
    ? [ '"-c"', `"node ${eclintPath} ${action}${eclintArgs}"` ]
    : [ `"${eclintPath}"`, `${action}${eclintArgs}` ]

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
const action = args[0]
if (args.length > 2 || (action !== 'check' && action !== 'fix')) {
  console.error('Usage: node fleclint.js <action> <directory (optional)>')
  console.error('  action')
  console.error('    "check"  checks that the directory tree matches its EditorConfig settings')
  console.error('    "fix"    fixes all files in the directory tree that do not match the EditorConfig settings')
  console.error('  directory  the directory to run against-uses the current working directory if not specified')
  process.exit(-1)
}

console.log('Running fleclint ...')

const directory = args.length === 2 ? args[1] : process.cwd()
enforceEditorConfig(action, directory)
