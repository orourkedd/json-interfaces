rivets.adapters[':'] =
  observe: (obj, keypath, callback) ->
    obj.on 'change:' + keypath, callback

  unobserve: (obj, keypath, callback) ->
    obj.off 'change:' + keypath, callback

  get: (obj, keypath) ->
    obj.forView keypath

  set: (obj, keypath, value) ->
    obj.setKeyPath keypath, value

rivets.adapters['#'] =
  observe: (obj, keypath, callback) ->

  unobserve: (obj, keypath, callback) ->

  get: (obj, methodName) ->
    obj[methodName]()

  set: (obj, keypath, value) ->