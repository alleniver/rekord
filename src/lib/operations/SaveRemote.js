function SaveRemote(model, cascade)
{
  this.reset( model, cascade );
}

extend( Operation, SaveRemote,
{

  cascading: Cascade.Remote,

  interrupts: false,

  type: 'SaveRemote',

  run: function(db, model)
  {
    if ( model.$isDeleted() )
    {
      Rekord.debug( Rekord.Debugs.SAVE_REMOTE_DELETED, model );

      this.markSynced( model, true, Model.Events.RemoteSaveFailure, null );
      this.finish();
    }
    else if ( !model.$dependents.isSaved( this.tryAgain, this ) )
    {
      this.finish();
    }
    else if ( !db.hasData( model.$saving ) || this.notCascade( Cascade.Rest ) )
    {
      this.liveSave();
      this.markSynced( model, true, Model.Events.RemoteSave, null );
      this.finish();
    }
    else
    {
      model.$status = Model.Status.SavePending;

      batchExecute(function()
      {
        if ( model.$saved )
        {
          db.rest.update( model, model.$saving, this.success(), this.failure() );
        }
        else
        {
          db.rest.create( model, model.$saving, this.success(), this.failure() );
        }

      }, this );
    }
  },

  onSuccess: function(response)
  {
    var db = this.db;
    var data = db.resolveModel( response );
    var model = this.model;

    Rekord.debug( Rekord.Debugs.SAVE_REMOTE, model );

    this.handleData( data );
  },

  onFailure: function(response, status)
  {
    var operation = this;
    var db = this.db;
    var data = db.resolveModel( response );
    var model = this.model;

    // A non-zero status means a real problem occurred
    if ( RestStatus.Conflict[ status ] ) // 409 Conflict
    {
      Rekord.debug( Rekord.Debugs.SAVE_CONFLICT, model, data );

      this.handleData( data );
    }
    else if ( RestStatus.NotFound[ status ] )
    {
      Rekord.debug( Rekord.Debugs.SAVE_UPDATE_FAIL, model );

      this.insertNext( RemoveNow );

      db.destroyModel( model );

      model.$trigger( Model.Events.RemoteSaveFailure, [model, response] );
    }
    else if ( RestStatus.Offline[ status ] )
    {
      // Check the network status right now
      Rekord.checkNetworkStatus();

      // If not online for sure, try saving once online again
      if (!Rekord.online)
      {
        model.$listenForOnline( this.cascade );

        model.$trigger( Model.Events.RemoteSaveOffline, [model, response] );
      }
      else
      {
        this.markSynced( model, true, Model.Events.RemoteSaveFailure, response );
      }

      Rekord.debug( Rekord.Debugs.SAVE_OFFLINE, model, response );
    }
    else
    {
      Rekord.debug( Rekord.Debugs.SAVE_ERROR, model, status );

      this.markSynced( model, true, Model.Events.RemoteSaveFailure, response );
    }
  },

  markSynced: function(model, saveNow, eventType, response)
  {
    model.$status = Model.Status.Synced;

    this.clearPending( model );

    if ( saveNow )
    {
      this.insertNext( SaveNow );
    }

    if ( eventType )
    {
      model.$trigger( eventType, [model, response] );
    }
  },

  clearPending: function(model)
  {
    delete model.$saving;
    delete model.$publish;

    if ( model.$local )
    {
      model.$local.$status = model.$status;

      delete model.$local.$saving;
      delete model.$local.$publish;
    }
  },

  handleData: function(data)
  {
    var db = this.db;
    var model = this.model;
    var saving = model.$saving;

    // Check deleted one more time before updating model.
    if ( model.$isDeleted() )
    {
      Rekord.debug( Rekord.Debugs.SAVE_REMOTE_DELETED, model, data );

      return this.clearPending( model );
    }

    Rekord.debug( Rekord.Debugs.SAVE_VALUES, model, saving );

    // If the model hasn't been saved before - create the record where the
    // local and model point to the same object.
    if ( !model.$saved )
    {
      model.$saved = model.$local ? (model.$local.$saved = {}) : {};
    }

    // Tranfer all saved fields into the saved object
    transfer( saving, model.$saved );

    // Update the model with the return data
    if ( !isEmpty( data ) )
    {
      db.putRemoteData( data, model.$key(), model );
    }

    this.liveSave( data );
    this.markSynced( model, false, Model.Events.RemoteSave, null );

    if ( db.cache === Cache.Pending )
    {
      this.insertNext( RemoveCache );
    }
    else
    {
      this.insertNext( SaveNow );
    }
  },

  liveSave: function(data)
  {
    var db = this.db;
    var model = this.model;

    if ( isObject(data) )
    {
      transfer( data, model.$publish );
    }

    if ( this.canCascade( Cascade.Live ) && db.hasData( model.$publish ) )
    {
      // Publish saved data to everyone else
      Rekord.debug( Rekord.Debugs.SAVE_PUBLISH, model, model.$publish );

      db.live.save( model, model.$publish );
    }
  },

  tryAgain: function()
  {
    var model = this.model;

    model.$addOperation( SaveLocal, this.cascade );
  }

});
