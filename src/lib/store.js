/**
 * A factory function for returning an object capable of storing objects for
 * retrieval later by the application.
 *
 * @param  {Database} database
 *         The database this store is for.
 * @return {Object} -
 *         An object with put, remove, and all functions.
 */
Rekord.defaultStore = Rekord.store = function(database)
{
  return {

    /**
     * Places a record in the store with the given key.
     *
     * @param  {String|Number} key
     *         The key to store the record as.
     * @param  {Object} record
     *         The record to store.
     * @param  {function} success
     *         A function to invoke when the record is successfully stored with
     *         the key. The arguments of the function should be the key and
     *         record passed to this function.
     * @param  {function} failure
     *         A function to invoke when the record failed to be stored with the
     *         key. The arguments of the function should be the key, record, and
     *         an error that occurred if available.
     */
    put: function(key, record, success, failure)
    {
      success( key, record );
    },

    // TODO
    get: function(key, success, failure)
    {
      failure( key, undefined );
    },

    /**
     * Removes a record from the store with the given key.
     *
     * @param  {String|Number} key
     *         The key to remove from the store.
     * @param  {function} success
     *         A function to invoke when the record doesn't exist in the store.
     *         The arguments of the function are the removedValue (if any) and
     *         the key passed to this function.
     * @param  {function} failure
     *         A function to invoke when there was an issue removing the key
     *         from the store. The arguments of the function are the key given
     *         to this function and an error that occurred if available.
     */
    remove: function(key, success, failure)
    {
      success( key );
    },

    /**
     * Returns all records and their keys to the given success callback.
     *
     * @param  {function} success
     *         The function to invoke with the array of records and an array
     *         of keys.
     * @param  {function} failure
     *         The function to invoke with the error that occurred if available.
     */
    all: function(success, failure)
    {
      success( [], [] );
    },


    /**
     * Resets the store so it contains ONLY the given keys & record pairs.
     *
     * @param {String[]} keys -
     *    The array of keys.
     * @param {Object[]} records -
     *    The array of records to save.
     * @param  {function} success
     *         The function to invoke with the array of records and an array
     *         of keys.
     * @param  {function} failure
     *         The function to invoke with the error that occurred if available.
     */
    reset: function(keys, records, success, failure)
    {
      success( keys, records );
    }

  };

};

/**
 * Sets the store implementation provided the factory function. This function
 * can only be called once - all subsequent calls will be ignored unless
 * `overwrite` is given as a truthy value.
 *
 * @memberof Rekord
 * @param {Function} factory -
 *    The factory which provides store implementations.
 * @param {Boolean} [overwrite=false] -
 *    True if existing implementations are to be ignored and the given factory
 *    should be the implementation.
 */
Rekord.setStore = function(factory, overwrite)
{
  if ( !Rekord.storeSet || overwrite )
  {
    Rekord.store = factory;
    Rekord.storeSet = true;
  }
};
