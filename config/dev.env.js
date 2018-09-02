'use strict'
const merge = require('webpack-merge')
const prodEnv = require('./prod.env')

module.exports = merge(prodEnv, {
  NODE_ENV: '"development"',
  BLOCKCHAIN: '"eos"',
  PROTOCOL: '"https://"',
  ENDPOINT: '"api.travelchain.io"',
  PORT: '"443"',
  CHAINID: '"0443d062bb782b32bdc07a65273e1696c9a28749c047124927c7160897cacd28"',
  ROOT_CONTRACT: '"imtruevester"',
  CORE_SYMBOL: '"TT"',
  CORE_PRECISION: 10000

})
