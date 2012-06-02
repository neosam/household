(function (window) {
  var getTemplate, Person, Household, PersonView, HouseholdView;

  getTemplate = _.memoize(function (templateName) {
    return _.template($('#' + templateName).html());
  });

  Person = Backbone.Model.extend({
    defaults: {
      firstName: '',
      lastName: '',
      age: ''
    }
  });

  Household = Backbone.Collection.extend({
    model: Person,
    url: '/person'
  });

  PersonView = Backbone.View.extend({
    className: 'PersonView',

    events: {
      'change': 'savePerson',
      'click .remove': 'removePerson'
    },

    initialize: function () {
      this.model.on('change', this.modelChanged, this);
      this.model.on('remove', this.remove, this);
    },

    modelChanged: function (model, options) {
      _.each(options.changes, function (changed, field) {
        this.$('.' + field).val(model.get(field));
      }, this);
    },

    savePerson: function (e) {
      this.model.set(e.target.className, e.target.value).save();
    },

    removePerson: function () {
      this.model.destroy();
    },

    render: function () {
      this.$el.html(getTemplate('PersonViewTemplate')({model: this.model}));
      return this;
    }
  });

  HouseholdView = Backbone.View.extend({
    className: 'HouseholdView',

    events: {
      'click .addPerson': 'addPerson',
      'click .removeAll': 'removeAll'
    },

    initialize: function () {
      this.model.on('reset add remove', this.render, this);
    },

    addPerson: function () {
      this.model.add();
      this.$('.PersonView:last > .firstName').focus();
    },

    removeAll: function () {
      while (this.model.length > 0) {
        this.model.at(0).destroy();
      }
    },

    addPersonView: function (person) {
      new PersonView({model: person}).render().$el.appendTo(this.$('.persons'));
    },

    render: function () {
      var template = getTemplate('HouseholdViewTemplate');
      this.$el.html(template({model: this.model}));
      this.model.each(this.addPersonView, this);
      return this;
    }
  });

  $(function () {
    var household = new Household();
    new HouseholdView({model: household}).$el.appendTo(window.document.body);
    new HouseholdView({model: household}).$el.appendTo(window.document.body);
    new HouseholdView({model: household}).$el.appendTo(window.document.body);

    household.fetch();
  });
})(this);