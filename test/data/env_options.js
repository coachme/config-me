module.exports = {
  common: {
    shared: true,
    option: 33,
    deep: {
      something: 66,
      testing: 'this is a value',
      things: [5, 6, 7, 8],
      extra: {
        foo: 'bar'
      }
    }
  },
  test: {
    deep: {
      something: 133,
      extra: false
    },
    option: 'a test value',
    unique: true
  },
  'test-env': {
    envOption: 'another test value'
  }
}
