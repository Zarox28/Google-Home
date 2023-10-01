// ----- LIBRARIES IMPORTATION -----
const childProcess = require('child_process')
const terminalKit = require('terminal-kit').terminal
const GoogleHome = require('google-home-push')

// ----- VARIABLES -----
let device = []

// ----- HOME MENU -----
function HomeMenu () {
  terminalKit.table([
    ['Command', 'Description'],
    ['scan', 'Scan nearby Google Home devices and display their IP address'],
    ['exit', 'Leave the program']
  ],
  {
    hasBorder: true,
    width: 72,
    borderChars: 'lightRounded',
    borderAttr: {
      color: 'blue'
    },
    firstCellTextAttr: {
      color: 'red'
    },
    firstRowTextAttr: {
      color: 'yellow'
    }
  })

  terminalKit.nextLine()
  terminalKit.magenta('Command: ')

  const autoComplete = ['scan', 'exit']

  terminalKit.inputField({
    autoComplete,
    autoCompleteMenu: true,
    autoCompleteHint: true
  },
  function (err, cmd) {
    if (err) throw err

    switch (cmd) {
      case 'scan':
        terminalKit.clear()
        ScanMenu()
        break

      case 'exit':
        terminalKit.clear()

        terminalKit.red('Are you sure to you want to leave the program ? [Y/n] ')
        terminalKit.yesOrNo({
          yes: ['y', 'ENTER', 'Y'],
          no: ['n', 'N']
        },
        function (err, choice) {
          if (err) throw err

          terminalKit.nextLine()

          if (choice) {
            terminalKit.clear()
            terminalKit.spinner()
            setTimeout(() => {
              terminalKit(' Stopping ... ')
            }, 10)

            setTimeout(() => {
              terminalKit.clear()
              process.exit()
            }, 2000)
          } else {
            terminalKit.clear()
            HomeMenu()
          }
        }
        )
        break

      default:
        terminalKit.clear()
        HomeMenu()
        break
    }
  }
  )
}

// ----- SCAN MENU -----
function ScanMenu () {
  childProcess.exec('node src/device.js', (err, stdout) => {
    if (err) throw err

    if (stdout !== '') {
      terminalKit.table([
        ['IP', 'PORT', 'NAME'],
        [
          stdout.split(':').shift(),
          stdout.split(':').pop().split('-').shift(),
          stdout.split('-').pop().split('').slice(0, -1).join('')
        ]
      ],
      {
        hasBorder: true,
        width: 40,
        borderChars: 'lightRounded',
        borderAttr: {
          color: 'blue'
        },
        firstCellTextAttr: {
          color: 'red'
        },
        firstRowTextAttr: {
          color: 'yellow'
        }
      })

      device = [
        stdout.split(':').shift(),
        stdout.split(':').pop().split('-').shift(),
        stdout.split('-').pop().split('').slice(0, -1).join('')
      ]

      terminalKit.nextLine()
      ActionsChoiceMenu()
    } else {
      terminalKit.red('No device detected !')

      setTimeout(() => {
        terminalKit.clear()

        terminalKit.spinner()
        setTimeout(() => {
          terminalKit(' Stopping ... ')
        }, 10)

        setTimeout(() => {
          terminalKit.clear()
          process.exit()
        }, 2000)
      }, 2000)
    }
  })
}

// ----- ACTIONS CHOICE MENU -----
function ActionsChoiceMenu () {
  terminalKit.cyan('What do you want to do ?')
  terminalKit.nextLine()

  const actions = [
    'a. Change Settings',
    'b. Say something',
    'C. Return to home'
  ]

  terminalKit.singleColumnMenu(actions, function (err, response) {
    if (err) throw err

    switch (response.selectedIndex) {
      case 0:
        terminalKit.clear()
        SettingsMenu()
        break

      case 1:
        terminalKit.clear()
        Tts()
        break

      case 2:
        terminalKit.clear()
        HomeMenu()
        break
    }
  })
}

// ----- SETTINGS MENU -----
function SettingsMenu () {
  childProcess.exec(`node node_modules/.bin/google-home-cli ${device[0]} volume`, (err, stdout) => {
    if (err) throw err

    terminalKit.table([
      ['IP', 'PORT', 'NAME', 'VOLUME'],
      [device[0], device[1], device[2], stdout]
    ],
    {
      hasBorder: true,
      width: 40,
      borderChars: 'lightRounded',
      borderAttr: {
        color: 'blue'
      },
      firstCellTextAttr: {
        color: 'red'
      },
      firstRowTextAttr: {
        color: 'yellow'
      }
    })

    terminalKit.nextLine()
    terminalKit.magenta('Command: ')

    const autoComplete = [
      'mute',
      'unmute',
      'status',
      'volume',
      'stop',
      'volup',
      'voldown',
      'back'
    ]

    terminalKit.inputField({
      autoCompleteMenu: true,
      autoComplete,
      autoCompleteHint: true
    },
    function (err, cmd) {
      if (err) throw err

      switch (cmd) {
        case 'mute':
          terminalKit.clear()
          childProcess.exec(`node node_modules/.bin/google-home-cli ${device[0]} mute`)
          terminalKit.green(`device ${device[2]} muted`)

          setTimeout(() => {
            terminalKit.clear()
            SettingsMenu()
          }, 2000)

          break

        case 'unmute':
          terminalKit.clear()
          childProcess.exec(`node node_modules/.bin/google-home-cli ${device[0]} unmute`)
          terminalKit.green(`device ${device[2]} unmuted`)

          setTimeout(() => {
            terminalKit.clear()
            SettingsMenu()
          }, 2000)

          break

        case 'status':
          childProcess.exec(`node node_modules/.bin/google-home-cli ${device[0]} status`, (err, stdout) => {
            if (err) throw err

            terminalKit.clear()
            terminalKit.green(stdout)
            terminalKit.grabInput(true)
            terminalKit.on('key', function (name, matches, data) {
              if (name === 'ENTER' || name === 'ESCAPE') {
                terminalKit.grabInput(false)
                terminalKit.clear()
                SettingsMenu()
              }
            })
          })

          break

        case 'volume':
          terminalKit.clear()
          terminalKit.cyan('What do you want to do ?')
          terminalKit.nextLine()

          terminalKit.singleColumnMenu(['a. Check volume', 'b. Change volume'], function (err, response) {
            if (err) throw err

            switch (response.selectedIndex) {
              case 0:
                terminalKit.clear()
                childProcess.exec(`node node_modules/.bin/google-home-cli ${device[0]} volume`, (err, stdout) => {
                  if (err) throw err

                  terminalKit.green(`Volume set to ${stdout}`)

                  setTimeout(() => {
                    terminalKit.clear()
                    SettingsMenu()
                  }, 2000)
                })

                break

              case 1:
                terminalKit.clear()
                terminalKit.magenta('Volume: ')

                terminalKit.inputField({}, function (err, volume) {
                  if (err) throw err

                  if (parseInt(volume)) {
                    childProcess.exec(`node node_modules/.bin/google-home-cli ${device[0]} volume ${volume}`)
                    terminalKit.clear()
                    terminalKit.green(`Volume set to ${volume}`)

                    setTimeout(() => {
                      terminalKit.clear()
                      SettingsMenu()
                    }, 2000)
                  } else {
                    terminalKit.clear()
                    terminalKit.red(`${volume} is not a number !`)

                    setTimeout(() => {
                      terminalKit.clear()
                      SettingsMenu()
                    }, 2000)
                  }
                })

                break
            }
          })

          break

        case 'stop':
          terminalKit.clear()
          childProcess.exec(`node node_modules/.bin/google-home-cli ${device[0]} stop`)
          terminalKit.green(`Media stopped on device ${device[2]}`)

          setTimeout(() => {
            terminalKit.clear()
            SettingsMenu()
          }, 2000)

          break

        case 'back':
          terminalKit.clear()
          ActionsChoiceMenu()

          break

        default:
          terminalKit.clear()
          SettingsMenu()
          break
      }
    })
  })
}

// ----- TTS MENU -----
function Tts () {
  const gh = new GoogleHome(device[0], { language: 'fr' })

  terminalKit.cyan('What do you want to do ?')
  terminalKit.nextLine()

  const actions = ['a. Say a text', 'b. Back']

  terminalKit.singleColumnMenu(actions, function (err, response) {
    if (err) throw err

    switch (response.selectedIndex) {
      case 0:
        terminalKit.clear()
        terminalKit.magenta('Text: ')
        terminalKit.inputField({}, function (err, text) {
          if (err) throw err

          terminalKit.clear()
          terminalKit.green(`Text: ${text}`)
          gh.speak(text.toLowerCase()).then(() => {
            terminalKit.clear()
            Tts()
          })
        })

        break

      case 1:
        terminalKit.clear()
        ActionsChoiceMenu()

        break
    }
  })
}

terminalKit.clear()
HomeMenu()
