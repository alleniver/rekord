
// The methods necessary for a filtered collection.
var Filtering = {

  bind: function()
  {
    this.onAdd      = bind( this, Filtering.handleAdd );
    this.onAdds     = bind( this, Filtering.handleAdds );
    this.onRemove   = bind( this, Filtering.handleRemove );
    this.onRemoves  = bind( this, Filtering.handleRemoves );
    this.onReset    = bind( this, Filtering.handleReset );
    this.onUpdates  = bind( this, Filtering.handleUpdates );
    this.onCleared  = bind( this, Filtering.handleCleared );
  },

  init: function(base, filter)
  {
    if ( this.base !== base )
    {
      if ( this.base )
      {
        this.disconnect();
      }

      this.base = base;
      this.connect();
    }

    this.filter = filter;
    this.sync();

    return this;
  },

  setFilter: function(whereProperties, whereValue, whereEquals)
  {
    this.filter = createWhere( whereProperties, whereValue, whereEquals );
    this.sync();

    return this;
  },

  connect: function()
  {
    this.base.on( Collection.Events.Add, this.onAdd );
    this.base.on( Collection.Events.Adds, this.onAdds );
    this.base.on( Collection.Events.Remove, this.onRemove );
    this.base.on( Collection.Events.Removes, this.onRemoves );
    this.base.on( Collection.Events.Reset, this.onReset );
    this.base.on( Collection.Events.Updates, this.onUpdates );
    this.base.on( Collection.Events.Cleared, this.onClear );

    return this;
  },

  disconnect: function()
  {
    this.base.off( Collection.Events.Add, this.onAdd );
    this.base.off( Collection.Events.Adds, this.onAdds );
    this.base.off( Collection.Events.Remove, this.onRemove );
    this.base.off( Collection.Events.Removes, this.onRemoves );
    this.base.off( Collection.Events.Reset, this.onReset );
    this.base.off( Collection.Events.Updates, this.onUpdates );
    this.base.off( Collection.Events.Cleared, this.onClear );

    return this;
  },

  sync: function()
  {
    var base = this.base;
    var filter = this.filter;
    var matches = [];

    for (var i = 0; i < base.length; i++)
    {
      var value = base[ i ];

      if ( filter( value ) )
      {
        matches.push( value );
      }
    }

    return this.reset( matches );
  },

  handleAdd: function(collection, value)
  {
    var filter = this.filter;

    if ( filter( value ) )
    {
      this.add( value );
    }
  },

  handleAdds: function(collection, values)
  {
    var filter = this.filter;
    var filtered = [];

    for (var i = 0; i < values.length; i++)
    {
      var value = values[ i ];

      if ( filter( value ) )
      {
        filtered.push( value );
      }
    }

    this.addAll( filtered );
  },

  handleRemove: function(collection, value)
  {
    this.remove( value );
  },

  handleRemoves: function(collection, values)
  {
    this.removeAll( values );
  },

  handleReset: function(collection)
  {
    this.sync();
  },

  handleUpdates: function(collection, updates)
  {
    var filter = this.filter;

    for (var i = 0; i < updates.length; i++)
    {
      var value = updates[ i ];

      if ( filter( value ) )
      {
        this.add( value, true );
      }
      else
      {
        this.remove( value, true );
      }
    }

    this.sort();
  },

  handleCleared: function(collection)
  {
    this.clear();
  },

  clone: function()
  {
    return new this.constructor( this.base, this.filter );
  },

  cloneEmpty: function()
  {
    return new this.constructor( this.base, this.filter );
  }

};
