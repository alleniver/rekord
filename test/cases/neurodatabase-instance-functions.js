
module( 'Neuro.Database instance functions' );

test( 'parseModel', function(assert)
{
  var parseModel = Neuro({
    name: 'parseModel',
    fields: ['id', 'name']
  });

  var db = parseModel.Database;

  var p0 = parseModel.create({id: 4, name: 'name0'});
  var p1 = parseModel.create({id: 5, name: 'name1'});

  strictEqual( parseModel.all().length, 2 );

  strictEqual( null, db.parseModel() );
  strictEqual( null, db.parseModel( null ) );
  strictEqual( null, db.parseModel( void 0 ) );
  strictEqual( p0, db.parseModel( p0 ) );
  strictEqual( p1, db.parseModel( 5 ) );
  strictEqual( p1, db.parseModel( {id:5} ) );
  strictEqual( null, db.parseModel( 34 ) );

  var p2 = db.parseModel( {id: 6, name: 'name2'} );

  isInstance( p2, parseModel );

  strictEqual( parseModel.all().length, 2 );

  var p3 = new parseModel({id: 7, name: 'name3'});

  strictEqual( parseModel.all().length, 2 );

  db.parseModel( p3 );

  strictEqual( parseModel.all().length, 3 );

  var p4 = db.parseModel( parseModel );

  isInstance( p4, parseModel );
});

test( 'remove key default', function(assert)
{
  var remove_key_default = Neuro({
    name: 'remove_key_default',
    fields: ['id', 'name']
  });

  var db = remove_key_default.Database;

  var r0 = remove_key_default.create({name: 'name0'});

  notStrictEqual( r0.id, void 0 );

  db.removeKey( r0 );

  strictEqual( r0.id, void 0 );
});

test( 'remove key prop', function(assert)
{
  var remove_key_prop = Neuro({
    name: 'remove_key_prop',
    key: 'key',
    fields: ['key', 'name']
  });

  var db = remove_key_prop.Database;

  var r0 = remove_key_prop.create({name: 'name0'});

  notStrictEqual( r0.key, void 0 );

  db.removeKey( r0 );

  strictEqual( r0.key, void 0 );
});

test( 'remove key props', function(assert)
{
  var remove_key_props = Neuro({
    name: 'remove_key_props',
    key: ['subject_id', 'object_id'],
    fields: ['subject_id', 'object_id', 'name']
  });

  var db = remove_key_props.Database;

  var r0 = remove_key_props.create({subject_id: 4, object_id: 5, name: 'name0'});

  notStrictEqual( r0.subject_id, void 0 );
  notStrictEqual( r0.object_id, void 0 );

  db.removeKey( r0 );

  strictEqual( r0.subject_id, void 0 );
  strictEqual( r0.object_id, void 0 );
});

test( 'buildKey', function(assert)
{
  var buildKey = Neuro({
    name: 'buildKey',
    fields: ['id', 'name', 'age']
  });

  var db = buildKey.Database;

  var b0 = buildKey.create({name: 'name0', age: 1});
  
  strictEqual( db.buildKey( b0, 'name' ), 'name0' );
  strictEqual( db.buildKey( b0, 'age' ), 1 );
  strictEqual( db.buildKey( b0, ['name', 'age'] ), 'name0/1' );
});

test( 'buildKeys', function(assert)
{
  var buildKeys = Neuro({
    name: 'buildKeys',
    fields: ['id', 'name', 'age']
  });

  var db = buildKeys.Database;

  var b0 = buildKeys.create({name: 'name0', age: 1});
  
  strictEqual( db.buildKeys( b0, 'name' ), 'name0' );
  strictEqual( db.buildKeys( b0, 'age' ), 1 );
  deepEqual( db.buildKeys( b0, ['name', 'age'] ), ['name0', 1] );
});

test( 'buildKeyFromInput', function(assert)
{
  var buildKeyFromInput = Neuro({
    name: 'buildKeyFromInput',
    fields: ['id', 'name']
  });

  var db = buildKeyFromInput.Database;

  var i0 = buildKeyFromInput.create({id: 89, name: 'name0'});
  var i1 = [1, 2];
  var i2 = {id: 34};
  var i3 = 'uuid';

  var e0 = 89;
  var e1 = '1/2';
  var e2 = 34;
  var e3 = 'uuid';

  strictEqual( db.buildKeyFromInput( i0 ), e0 );
  strictEqual( db.buildKeyFromInput( i1 ), e1 );
  strictEqual( db.buildKeyFromInput( i2 ), e2 );
  strictEqual( db.buildKeyFromInput( i3 ), e3 );
});

test( 'buildKeyFromArray', function(assert)
{
  var buildKeyFromArray = Neuro({
    name: 'buildKeyFromArray',
    fields: ['id', 'name']
  });

  var db = buildKeyFromArray.Database;

  var i0 = [1];
  var i1 = [2,3];

  var e0 = '1';
  var e1 = '2/3';

  strictEqual( db.buildKeyFromArray( i0 ), e0 );
  strictEqual( db.buildKeyFromArray( i1 ), e1 );
});

test( 'setRevision', function(assert)
{
  var Todo = Neuro({
    name: 'setRevision_todo',
    fields: ['id', 'name', 'done', 'updated_at', 'created_at'],
    defaults: {
      name: null,
      done: false,
      updated_at: Date.now,
      created_at: Date.now
    }
  });

  var db = Todo.Database;

  isType( db.revisionFunction, 'function' );

  var t0 = Todo.create({
    name: 'todo0'
  });

  strictEqual( t0.done, false );

  Neuro.live.setRevision_todo.save({
    id: t0.id,
    done: true,
    updated_at: Date.now() + 100
  });

  strictEqual( t0.done, true );

  Neuro.live.setRevision_todo.save({
    id: t0.id,
    done: false,
    updated_at: Date.now() - 100
  });

  strictEqual( t0.done, false );

  db.setRevision( 'updated_at' );

   Neuro.live.setRevision_todo.save({
    id: t0.id,
    done: true,
    updated_at: Date.now() - 200
  });

  strictEqual( t0.done, false );
});

test( 'sort', function(assert)
{
  var sort = Neuro({
    name: 'sort',
    fields: ['id', 'age'],
    comparator: 'age'
  });

  var db = sort.Database;

  var s0 = sort.create({age: 4});
  var s1 = sort.create({age: 5});
  var s2 = sort.create({age: 3});

  var expected0 = [s2, s0, s1];

  ok( Neuro.equals( sort.all().toArray(), expected0 ) );

  s1.age = 2;

  ok( Neuro.equals( sort.all().toArray(), expected0 ) );

  notOk( db.isSorted() );

  db.sort();

  var expected1 = [s1, s2, s0];

  ok( Neuro.equals( sort.all().toArray(), expected1 ) );
});

test( 'setComparator', function(assert)
{
  var setComparator = Neuro({
    name: 'setComparator',
    fields: ['id', 'name'],
    comparator: 'id'
  });

  var db = setComparator.Database;

  var s0 = setComparator.create({id: 1, name: 'name0'});
  var s1 = setComparator.create({id: 3, name: null});
  var s2 = setComparator.create({id: 2, name: 'name1'});

  var expected0 = [s0, s2, s1];

  ok( Neuro.equals( setComparator.all().toArray(), expected0 ) );

  db.setComparator( '-name', true );

  var expected1 = [s1, s2, s0];

  ok( Neuro.equals( setComparator.all().toArray(), expected1 ) );
});

test( 'refresh', function(assert)
{
  var rest = Neuro.rest.refresh = new TestRest();
  rest.map.put( 2, {id: 2, name: 'name2'} );
  rest.map.put( 3, {id: 3, name: 'name3'} );

  var refresh = Neuro({
    name: 'refresh',
    fields: ['id', 'name']
  });

  var db = refresh.Database;

  strictEqual( refresh.all().length, 2 );

  rest.map.put( 4, {id: 4, name: 'name4'} );
  rest.map.put( 2, {id: 2, name: 'name2b'} );

  strictEqual( refresh.all().length, 2 );

  db.refresh();

  strictEqual( refresh.all().length, 3 );  
});

test( 'refresh callback', function(assert)
{
  var done = assert.async();

  var rest = Neuro.rest.refresh_callback = new TestRest();
  rest.map.put( 2, {id: 2, name: 'name2'} );
  rest.map.put( 3, {id: 3, name: 'name3'} );

  var refresh = Neuro({
    name: 'refresh_callback',
    fields: ['id', 'name']
  });

  var db = refresh.Database;

  strictEqual( refresh.all().length, 2 );

  rest.delay = 10;
  rest.map.put( 4, {id: 4, name: 'name4'} );
  rest.map.put( 2, {id: 2, name: 'name2b'} );

  strictEqual( refresh.all().length, 2 );

  var context = {d: 34};

  var onRefresh = function(all)
  {
    strictEqual( context, this );
    strictEqual( all.length, 3 );  

    done();
  };

  db.refresh( onRefresh, context );
});

test( 'refresh relationships', function(assert)
{
  var prefix = 'NeuroDatabase_refresh_relationships_';

  var Task = Neuro({
    name: prefix + 'task',
    fields: ['list_id', 'name', 'done'],
    defaults: { done: false },
    cache: Neuro.Cache.None,
    belongsTo: {
      list: {
        model: prefix + 'list',
        local: 'list_id'
      }
    },
    toString: function(task) {
      return task.name;
    }
  });

  var TaskList = Neuro({
    name: prefix + 'list',
    fields: ['name'],
    hasMany: {
      tasks: {
        model: prefix + 'task',
        foreign: 'list_id',
        save: Neuro.Save.Model,
        store: Neuro.Store.Model,
        comparator: 'name'
      }
    },
    toString: function(list) {
      return list.name;
    }
  });
  
  var remoteTasks = Task.Database.rest;
  var localTasks = Task.Database.store;
  var db = TaskList.Database;
  var remote = db.rest;

  var t0 = Task.create({name: 't0'});
  var t1 = Task.create({name: 't1'});
  var t2 = Task.create({name: 't2'});
  var l0 = TaskList.create({name: 'l0', tasks:[t0, t1, t2]});

  strictEqual( t0.list, l0 );
  strictEqual( t1.list, l0 );
  strictEqual( t2.list, l0 );

  remote.map.put( l0.id, {
    id: l0.id,
    name: l0.name,
    tasks: [
      {
        id: t1.id, list_id: l0.id, name: t1.name, done: true
      },
      {
        id: t2.id, list_id: l0.id, name: t2.name, done: false
      },
      {
        id: 45, list_id: l0.id, name: 't3', done: true
      },
      {
        id: 46, list_id: l0.id, name: 't4', done: false
      }
    ]
  });

  remoteTasks.lastModel = remoteTasks.lastRecord = null;

  strictEqual( Task.all().length, 3 );

  db.refresh();

  ok( t0.$isDeleted() );
  notOk( t1.$isDeleted() );
  notOk( t2.$isDeleted() );

  strictEqual( l0.tasks.length, 4 );
  strictEqual( l0.tasks[0], t1 );
  strictEqual( l0.tasks[1], t2 );

  strictEqual( l0.tasks[0].done, true );
  strictEqual( l0.tasks[1].done, false );
  strictEqual( l0.tasks[2].name, 't3' );
  strictEqual( l0.tasks[3].name, 't4' );

  strictEqual( Task.all().length, 4 );
  strictEqual( remoteTasks.lastModel, null, 'not removed remotely' );
  strictEqual( remoteTasks.lastRecord, null );
});

test( 'getModel', function(assert)
{
  var getModel = Neuro({
    name: 'getModel',
    fields: ['id', 'name']
  });

  var db = getModel.Database;

  getModel.create({id: 1, name: 'name1'});
  getModel.create({id: 2, name: 'name2'});
  getModel.create({id: 3, name: 'name3'});

  strictEqual( getModel.all().length, 3 );

  strictEqual( db.get(2).name, 'name2' );
  strictEqual( db.get([3]).name, 'name3' );

  strictEqual( db.get(4), void 0 );
  strictEqual( db.get(23), void 0 );
});

test( 'change', function(assert)
{
  var change = Neuro({
    name: 'change',
    fields: ['id', 'name']
  });

  var db = change.Database;

  expect(2);

  var off = db.change(function()
  {
    notOk();
  });

  db.updated();
  db.updated();

  off();

  db.updated();

});