const EnvConfigStore = require('../EnvConfigStore')
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

describe('EnvConfigStore', () => {
  beforeEach(() => {
    delete process.env.HAM
  })

  it('fetches config values from the environment', async () => {
    let config = new EnvConfigStore({ keys: ['HAM'] })
    process.env.HAM = 'HAM1'
    await config.refreshValues()
    expect(config.get('HAM')).toEqual('HAM1')
  })

  it('can refresh on an interval', async () => {
    let config = new EnvConfigStore({ keys: ['HAM'] })
    process.env.HAM = 'HAM1'
    await config.refreshValues()
    expect(config.get('HAM')).toEqual('HAM1')
    let stop = config.refreshOnInterval(100)
    process.env.HAM = 'HAM2'
    await sleep(120)
    expect(config.get('HAM')).toEqual('HAM2')
    stop()
  })
})
