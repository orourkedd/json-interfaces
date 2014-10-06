class JsonInterfaces.elements.Password extends JsonInterfaces.elements.ScalarElement

  constructor: (options)->
    options = $.extend
      label: "Password"
      template: JsonInterfaces.templates.password
      min: 6
      , options

    options.validators ||= []
    options.validators.push (value, parentElement, done)->
      return done() unless value
      done("Password must be at least #{options.min} characters long." unless validator.isLength(value, options.min))

    super options