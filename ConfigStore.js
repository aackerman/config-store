'use strict'
const EventEmitter = require('events')

 // default expiry 3 mins
const DEFAULT_EXPIRY = 3 * 60 * 1000

class ConfigStore {
  constructor({ keys, expiryMs = DEFAULT_EXPIRY }) {
    this.keys = keys
    this.isRefreshing = false
    this.expiryMs = expiryMs
    this.eventEmitter = new EventEmitter()
    this.cache = {
      expiration: new Date(0),
      items: {},
    }

    if (!keys || !Array.isArray(keys) || keys.length === 0) {
      throw new Error('Provide a non-empty array of config keys')
    }

    if (expiryMs <= 0) {
      throw new Error('Specify an expiry (ms) greater than 0')
    }
  }

  validate(keys, config) {
    let missing = keys.filter(k => config[k] === undefined)
    if (missing.length > 0) {
      throw new Error(`Missing keys '${missing}' in fetched values`)
    }
  }

  getKeys() {
    return this.keys
  }

  get(key) {
    let now = new Date()
    if (now >= this.cache.expiration) {
      this.refreshValues()
    }
    return this.cache.items[key]
  }

  createRefreshTimer(ms) {
    return setTimeout(() => {
      this.refreshValues()
      this.timeout = this.createRefreshTimer(ms)
    }, ms)
  }

  refreshOnInterval(ms) {
    this.timeout = this.createRefreshTimer(ms)
    return () => clearTimeout(this.timeout)
  }

  async refreshValues() {
    let keys = this.getKeys()
    if (this.isRefreshing) {
      return
    } else {
      this.isRefreshing = true
      // console.log(`Refreshing values for keys: '${keys}'`)
    }

    try {
      let config = await this.fetchValues()
      this.validate(keys, config)
      // console.log(`Successfully refreshed values for keys: '${keys}'`)
      let now = new Date()
      this.cache.expiration = new Date(now.getTime() + this.expiryMs)
      this.cache.items = config
      this.eventEmitter.emit('refresh')
    } finally {
      this.isRefreshing = false
    }
  }

  async fetchValues() {
    throw new Error('Expected `fetchValues` to be defined by a subclass')
  }
}

module.exports = ConfigStore
