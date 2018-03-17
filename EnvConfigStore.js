const ConfigStore = require('./ConfigStore')

class EnvConfigStore extends ConfigStore {
  async fetchValues() {
    let values = {}
    for (let key of this.getKeys()) {
      values[key] = process.env[key]
    }
    return values
  }
}

module.exports = EnvConfigStore
