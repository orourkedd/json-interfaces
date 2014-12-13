rivets.adapters[':'] =
  subscribe: (obj, keypath, callback) ->
    obj.on 'change:' + keypath, callback

  unsubscribe: (obj, keypath, callback) ->
    obj.off 'change:' + keypath, callback

  read: (obj, keypath) ->
    obj.forView keypath

  publish: (obj, keypath, value) ->
    obj.setKeyPath keypath, value

rivets.adapters['#'] =
  subscribe: (obj, keypath, callback) ->

  unsubscribe: (obj, keypath, callback) ->

  read: (obj, methodName) ->
    obj[methodName]()

  publish: (obj, keypath, value) ->