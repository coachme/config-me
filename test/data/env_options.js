module.exports = {
  common: {
    shared: true,
    option: 33,
    deep: {
      something: 66,
      testing: 'this is a value',
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
