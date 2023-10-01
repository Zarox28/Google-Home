// ----- LIBRARIES IMPORTATION -----
const GoogleHome = require('google-home-push')

// ----- HOUSE OBJECT -----
const house = new GoogleHome()

// ----- DEVICE SEARCHING -----
house.searchDevice()
setTimeout(() => {
  process.exit()
}, 1000)
