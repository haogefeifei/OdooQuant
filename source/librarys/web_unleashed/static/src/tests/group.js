openerp.unleashed.module('web_unleashed', function(base, _, Backbone){

    openerp.testing.section('Group Collection', function (test) {

        var Connector = base.utils('Connector'),
            Model = null;

        var sync = function(method, model, options){
            if(!model.model_name){
                throw base.error('The "model_name" is not defined on Backbone Model.');
            }

            // compound query context with user context
            options = options || {};

            // instantiate a JSON-RPC model object to communicate with OpenERP by JSON-RPC
            var connection = new Model(
                model.model_name,
                options.context
            );

            return Connector[method].apply(Connector, [model, options, connection]);
        };



        test('fetch', {templates: false, rpc: 'mock', asserts: 50 }, function (instance, $fixture, mock) {

            var nb_records = 105, nb_groups = 10;

            //fake response to JSON-RPC call
            mock('/web/dataset/search_read', function (call) {
                var result = [], item_id = null;

                for(var i= 1 ; i <= nb_records ; i++){
                    item_id = i % 10 == 0 ? 10 : i % 10;
                    result.push({id: i, name: 'item ' + i, item_id: item_id, str: 'item ' + item_id});
                }

                return { records: result };
            });

            Model = instance.web.Model;

            // group by id

            var def1 = $.Deferred();

            var Group = base.collections('Group');

            var List1 = Group.extend({
                model_name: 'unit.test',
                sync: sync,

                group_by: 'item_id'
            });

            var list = new List1();

            list.fetch().done(function(){
                strictEqual(_.size(list.groups()), 10, 'collection has 10 groups');

                strictEqual(list.isGroup(), false, 'list is not a group');
                strictEqual(list.group(1).isGroup(), true, 'group 1 is a group');

                strictEqual(list.group(1).length, 11, 'group with id 1 has 11 models');
                strictEqual(list.group(10).length, 10, 'group with id 10 has 10 models');
                strictEqual(list.group(10) instanceof Group, true, 'group 10 is an instance of Group');
                strictEqual(list.group(10).where({name: 'item 20'}).length, 1, 'group 10 has a model named item 20');

                strictEqual(list.max, 11, 'collection group max size is 11');


                list.get(1).set({name: 'override name 1'});
                strictEqual(list.get(1).get('name'), 'override name 1', 'reference is kept with the added model on the list');
                strictEqual(list.group(1).get(1).get('name'), 'override name 1', 'reference is kept with the added model on the group');


                var model1 = new Backbone.Model({
                    id: nb_records + 1,
                    name: 'item ' + (nb_records + 1),
                    item_id: 1
                });
                list.push(model1);

                strictEqual(list.group(1).length, 12, 'group 1 has 12 models');

                strictEqual(list.max, 12, 'collection group max size is 12');


                var model2 = new Backbone.Model({
                    id: nb_records + 2,
                    name: 'item ' + (nb_records + 2),
                    item_id: 11
                });
                list.push(model2);

                strictEqual(list.group(11).length, 1, 'group 11 has 1 model');

                list.remove(model1);

                strictEqual(list.group(1).length, 11, 'group 1 has 11 models');


                strictEqual(list.max, 11, 'collection group max size is 11');


                list.remove(model2);

                strictEqual(list.hasGroup(11), false, 'group 11 does not exist anymore');

                list.group(1).push(model1);

                strictEqual(list.group(1).length, 12, 'on model added to group 1, 12 models');
                strictEqual(list.length, 106, 'list has 105 models + the model added to the group');

                strictEqual(list.max, 12, 'collection group max size is 12');



                model1.set({name: 'override name 2'});
                strictEqual(list.get(106).get('name'), 'override name 2', 'reference is kept with the added model on the list');
                strictEqual(list.group(1).get(106).get('name'), 'override name 2', 'reference is kept with the added model on the group');

                list.group(1).remove(model1);

                strictEqual(list.group(1).length, 11, 'on model removed from group 1, 11 models');
                strictEqual(list.length, 105, 'list has 105 models again');

                strictEqual(list.max, 11, 'collection group max size is 11');


                var catched = false;
                try {
                    list.group(1).push(model2);
                }
                catch(e){
                    catched = true;
                }
                strictEqual(catched, true, 'exception catched when a model is added to a group with a different index');

                def1.resolve();
            });

            // group by string

            var def2 = $.Deferred();

            var List2 = Group.extend({
                model_name: 'unit.test',
                sync: sync,

                group_by: 'str'
            });

            var list = new List2();

            list.fetch().done(function(){

                strictEqual(_.size(list.groups()), 10, 'collection has 10 groups');

                strictEqual(list.group('item 1').length, 11, 'group with id 1 has 11 models');
                strictEqual(list.group('item 10').length, 10, 'group with id 10 has 10 models');
                strictEqual(list.group('item 10') instanceof Group, true, 'group 10 is an instance of Group');
                strictEqual(list.group('item 10').where({name: 'item 20'}).length, 1, 'group 10 has a model named item 20');

                strictEqual(list.max, 11, 'collection group max size is 11');



                var model1 = new Backbone.Model({
                    id: nb_records + 1,
                    name: 'item ' + (nb_records + 1),
                    item_id: 1,
                    str: 'item ' + 1
                });
                list.push(model1);

                strictEqual(list.group('item 1').length, 12, 'group "item 10" has 12 models');

                strictEqual(list.max, 12, 'collection group max size is 12');


                var model2 = new Backbone.Model({
                    id: nb_records + 2,
                    name: 'item ' + (nb_records + 2),
                    item_id: 11,
                    str: 'item ' + 11
                });
                list.push(model2);

                strictEqual(list.group('item 11').length, 1, 'group "item 11" has 1 model');

                list.remove(model1);

                strictEqual(list.group('item 1').length, 11, 'group "item 1" has 11 models');

                strictEqual(list.max, 11, 'collection group max size is 11');


                def2.resolve();
            });


            // group by function

            var def3 = $.Deferred();

            var List3 = Group.extend({
                model_name: 'unit.test',
                sync: sync,

                group_by: function(model){
                    return model.str;
                }
            });

            var list = new List3();

            list.fetch().done(function(){

                strictEqual(_.size(list.groups()), 10, 'collection has 10 groups');

                strictEqual(list.group('item 1').length, 11, 'group with id 1 has 11 models');
                strictEqual(list.group('item 10').length, 10, 'group with id 10 has 10 models');
                strictEqual(list.group('item 10') instanceof Group, true, 'group 10 is an instance of Group');
                strictEqual(list.group('item 10').where({name: 'item 20'}).length, 1, 'group 10 has a model named item 20');

                strictEqual(list.max, 11, 'collection group max size is 11');


                var model1 = new Backbone.Model({
                    id: nb_records + 1,
                    name: 'item ' + (nb_records + 1),
                    item_id: 1,
                    str: 'item ' + 1
                });
                list.push(model1);

                strictEqual(list.group('item 1').length, 12, 'group "item 10" has 12 models');

                strictEqual(list.max, 12, 'collection group max size is 12');


                var model2 = new Backbone.Model({
                    id: nb_records + 2,
                    name: 'item ' + (nb_records + 2),
                    item_id: 11,
                    str: 'item ' + 11
                });
                list.push(model2);

                strictEqual(list.group('item 11').length, 1, 'group "item 11" has 1 model');

                list.remove(model1);

                strictEqual(list.group('item 1').length, 11, 'group "item 1" has 11 models');

                strictEqual(list.max, 11, 'collection group max size is 11');


                list.reset();

                strictEqual(_.size(list.groups()), 0, 'reset: no more groups');
                strictEqual(list.length, 0, 'reset: no more models');
                strictEqual(list.max, 0, 'collection group max size is 0');



                def3.resolve();
            });



            return $.when(def1, def2, def3);
        });

    });

});
