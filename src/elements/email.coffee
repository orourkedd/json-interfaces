class JsonInterfaces.elements.Email extends JsonInterfaces.elements.Textfield

  constructor: (options)->
    options.template = JsonInterfaces.templates.email unless options.template

    options.validators ||= []
    options.validators.push (value, parentElement, done)->
      return done() unless value
      done('Valid email required.' unless validator.isEmail(value))

    super options

  afterRender: ->
    super
    @options.$el.addClass(@options.classes)

    #add a debounced function here for the input
    if @options.instantChange
      @input().on 'keyup', (e)=>
        @set $(e.currentTarget).val()