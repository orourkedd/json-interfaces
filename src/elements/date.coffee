class JsonInterfaces.elements.DateField extends JsonInterfaces.elements.Textfield

  constructor: (options)->
    options.template = JsonInterfaces.templates.date unless options.template

    options.validators.push (value, parentElement, done)->
      return done() unless value
      done('Please enter a valid date.' unless validator.isDate(value))

    super options

  forView: (keypath)->
    #@see - http://stackoverflow.com/questions/6978631/how-to-set-date-format-in-html-date-input-tag
    value = super()
    return '' unless value
    date = new Date(value) if typeof value is 'string'
    date.toISOString().substring(0, 10)