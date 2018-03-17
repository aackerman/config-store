const ConfigStore = require('./ConfigStore')

class SsmConfigStore extends ConfigStore {
  constructor(args) {
    super(args)
    this.keyPrefix = args.keyPrefix || ''
    this.ssm = args.ssm
  }

  async fetchValues() {
    let keys = this.getKeys()
    let keyPrefix = this.keyPrefix

    let req = {
      Names: keys.map(k => `${keyPrefix}${k}`),
      WithDecryption: true
    }

    let {
      Parameters
    } = await this.ssm.getParameters(req).promise()

    let values = {}
    for (let p of Parameters) {
      let name = p.Name.replace(keyPrefix, '')
      values[name] = p.Value
    }
    return values
  }
}

module.exports = SsmConfigStore
