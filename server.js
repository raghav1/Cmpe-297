var http = require('http');
var express = require('express'); // call express
var app = express(); // define our app using express
var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
var mysql = require('mysql');
require('./app/routes')(app); // configure our routes
var AWS = require('aws-sdk');
AWS.config.update({ accessKeyId:process.env.AWSAccessKeyId ,
    secretAccessKey:process.env.AWSSecretKey ,region: 'us-west-1'});


dyn =  new AWS.DynamoDB();
var vogels = require('vogels');
vogels.dynamoDriver(dyn);
// Checking to see if tables exist
dyn.listTables(function(err, data) {
    console.log('listTables', err, data);
    
    calls(err, data);
}, calls);
/** ALL MY MODELS* */
var catalog = vogels.define('catalog', function(schema) {
    schema.String('name', {
        hashKey: true
    });
    schema.String('description');
});
var Items = vogels.define('item', function(schema) {
    schema.String('name', {
        hashKey: true
    });
    schema.String('catalog');
    schema.String('description');
    schema.Number('quantity');
    schema.String('cost');
});
var cart = vogels.define('cart', function(schema) {
    schema.Number('id', {
        hashKey: true
    });
    schema.String('items');

})

function calls(err, data) {
    if (err) {
        console.log("err");
    } else if (data.TableNames.length > 0) {
   // startBatchWrite();
 callback();
    } else {
        var call = vogels.createTables({
            'catalog': {
                readCapacity: 1,
                writeCapacity: 1
            },
            'item': {
                readCapacity: 1,
                writeCapacity: 1
            },
            'cart': {
                readCapacity: 1,
                writeCapacity: 1
            }
        }, function(err) {
            if (err) {
                console.log('Error creating tables', err);
            } else {
                console.log('table are now created and active');
                callback();
            }
        }, callback);

    }

};
// Defining my routes
var User = require("./app/models/user");
app.post("/signup", function(req, res) {
var profile;
User.signup(req.body, function(err, user) {
// console.log("error"+err)
if (err||err!==null) {
     res.send(err);
        return;
    } else {
       try{
       var items = [];
       var item = JSON.stringify(items);
       var acc = new cart({ id: user.insertId, items: item });
       acc.save(function(err) {
    console.log('created account in DynamoDB'); if (err) { res.send(err); }
     else { res.send({ message: "Success" }); } });
       }catch(err)
       {
       res.json({message:"Something went wrong. Try back later"});
       }
    }
});
/*
 * 
 */
});
// All My cart operations
var router = express.Router();
router.route('/cart/:id')
.post(function(req,res){
	var items=JSON.parse(req.body.items);
	var total=0.0;
	
	for(var i=0;i<items.length;i++)
		{
		console.log(items[i]);
		total+=(parseFloat(items[i].cost)*items[i].quantity);
		Items.update({name : items[i].item, quantity : {$add : Math.abs(items[i].quantity) * -1}}, function (err, acc) {
			  if(err)
				  {
				  console.log(err);
				  }
			});
		}
	console.log(total.toFixed(2));
	console.log(req.params.id);
	
    var item = JSON.stringify([]);
    cart.update({
        id: req.params.id,
        items: item
    }, function(err, post) {
        
    });
    var data={
    		id: req.params.id,	
    		total:total.toFixed(2),
    		items:JSON.stringify(items),
    		creditcard:req.body.creditcard
    		
    };
    User.checkout(data, function(err, user) {
    	console.log("error"+err)
    	
    	});
	res.json({message:"Checked Out"});
})
    .get(function(req, res) {
        cart.get(req.params.id, function(err, acc) {
            if (err) {
                res.send(400, 'User cart not found');
            } else {
            	try
            	{
                var item = JSON.parse(acc.attrs.items);
                var batchGet = [];
                for (i in item) {
                	
                    batchGet.push(item[i].item);
                }
               // console.log(batchGet);
                Items.getItems(batchGet, function(err, accounts) {
                    if (err)
                        res.send(err);
                    else res.json({
                        cart: acc,
                        items: accounts
                    }); // prints loaded 3 accounts
                });
            	}
            	catch(err)
            	{
            		res.json({message:"No Item found"});
            	}
            }
        })
    })
    .put(function(req, res) {
        if (req.body.opt === "add") {
            cart.get(req.params.id, function(err, acc) {
                    if (err) {
                        res.send(400, 'User cart not found');
                    } else {
                    	console.log(acc);
                    	try
                    	{
                        var items = JSON.parse(acc.attrs.items);
                        var item = req.body.item;
                        var quantity = req.body.quantity;
                        items.push({
                            item: item,
                            quantity: quantity
                        });
                        jsonStr = JSON.stringify(items);
                        cart.update({
                            id: req.params.id,
                            items: jsonStr
                        }, function(err, post) {
                            if (err)
                                res.send(err);
                            else
                                res.send(post);
                        });
                    }catch(err)
                    {
                    console.log(err);	
                    }
                    }
                }

            );
        } else if (req.body.opt === "clear") {
            cart.get(req.params.id, function(err, acc) {
                    if (err) {
                        res.send(400, 'User cart not found');
                    } else {

                        var items = []
                        var item = JSON.stringify(items);
                        cart.update({
                            id: req.params.id,
                            items: item
                        }, function(err, post) {
                            if (err)
                                res.send(err);
                            else
                                res.send(post);
                        });
                    }
                }

            );
        } else if (req.body.opt === "chngeQuantity") {
            cart.get(req.params.id, function(err, acc) {
                    if (err) {
                        res.send(400, 'User cart not found');
                    } else {

                        var items = JSON.parse(acc.attrs.items);
                        var item = req.body.item;
                        var quantity = req.body.quantity;
                        var oldItem = false;
                        for (var i in items) {
                            console.log(i);
                            if (items[i].item === item) {
                                items[i].quantity = quantity;
                                oldItem = true;
                                break;
                            }
                        }
                        if (oldItem) {
                            jsonStr = JSON.stringify(items);
                            cart.update({
                                id: req.params.id,
                                items: jsonStr
                            }, function(err, post) {
                                if (err)
                                    res.send(err);
                                else
                                    res.send(post);
                            });
                        } else {
                            res.send(400, 'Item not found');
                        }


                    }
                }

            );
        } else if (req.body.opt === "del") {
            cart.get(req.params.id, function(err, acc) {
                    if (err) {
                        res.send(400, 'User cart not found');
                    } else {

                        var items = JSON.parse(acc.attrs.items);
                        var item = req.body.item;
                        var oldItem = false;
                        for (var i in items) {
                            console.log(i);
                            if (items[i].item === item) {
                                items.splice(i, 1);
                                oldItem = true;
                                break;
                            }
                        }
                        if (oldItem) {
                            jsonStr = JSON.stringify(items);
                            cart.update({
                                id: req.params.id,
                                items: jsonStr
                            }, function(err, post) {
                                if (err)
                                    res.send(err);
                                else
                                    res.send(post);
                            });
                        } else {
                            res.send(400, 'Item not found');
                        }
                    }
                }

            );
        } else {
            res.send(400, 'Invalid operations');
        }
    });




var callback = function() {
	
var param=require("./public/DynamoDump");
var param2=require("./public/DynamoDump2");
var param3=require("./public/DynamoDump3");
var newParams={
RequestItems:param.RequestItems
,
"ReturnConsumedCapacity": "TOTAL"
};
var newParams2={
		RequestItems:param2.RequestItems
		,
		"ReturnConsumedCapacity": "TOTAL"
		};
var newParams3={
		RequestItems:param3.RequestItems
		,
		"ReturnConsumedCapacity": "TOTAL"
		};
//console.log(newParams2);
//console.log(newParams);
dyn.batchWriteItem(newParams, function(err, data) {
        if (err) console.log(err, err.stack); // an error occurred
        // successful response
        dyn.batchWriteItem(newParams2, function(err, data) {
            if (err) console.log(err, err.stack); // an error occurred
            /// successful response
            dyn.batchWriteItem(newParams3, function(err, data) {
                if (err) console.log(err, err.stack); // an error occurred
                /// successful response
               startBatchWrite();
            }); 
        }); 
    });    
       
  
	 try{
	       var items = [];
	       var item = JSON.stringify(items);
	       var acc = new cart({ id: 1, items: item });
	       acc.save(function(err) {
	    console.log('created account in DynamoDB'); if (err) { res.send(err); }
	     else { console.log({ message: "Success" });
	       }});
	       }
	 catch(err)
	       {
		 console.log({message:"Something went wrong. Try back later"});
	       }
	// startBatchWrite();
};
var startBatchWrite=function(){


    app.use(express.static(__dirname + '/public'));
    app.use('/user', router);
    app.use('/admin', router2);
    app.set('port', 80);
    http.createServer(app).listen(app.get('port'), function() {
        console.log('Express server listening on port ' + app.get('port'));
    });
    exports = module.exports = app;
};

router.route('/catalog')
    .get(function(req, res) {
        catalog
            .scan()
            
            .loadAll()
            .exec(function(err, resp) {
                if (err) {
                    res.send('Error running scan', err);
                } else {

                    res.send(resp);

                }
            });

    });

var router2 = express.Router();
router2.route('/catalog')
    .post(function(req, res) {

        var acc = new catalog({
            name: req.body.name,
            description: req.body.description
        });
        acc.save(function(err) {
            console.log('created account in DynamoDB');
            if (err) {
                res.send(err);
            } else {
                res.send({
                    message: "Success"
                });
            }
        });
    });
router2.route('/item')
    .post(function(req, res) {
        var item = new Items({
            name: req.body.name,
            description: req.body.description,
            catalog: req.body.catalog,
            quantity: req.body.quantity,
            cost: req.body.cost
        });
        
        item.save(
            function(err, item) {
                console.log('created account in DynamoDB');
                if (err) {
                    res.send(err);
                } else {
                    res.send({
                        message: "Success"
                    });
                }
            }
        );
    })
     .delete(function(req, res) {
        Items.destroy(req.body.name, function(err) {
            if (err)
                res.send(err);
            else {
                res.json({
                    message: "Success"
                });
            }
        });
    })
router.route('/').get(function(req,res){
res.json("hi");
});
router.route('/item')
    .get(function(req, res) {
        Items
            .scan()
            
            .loadAll()
            .exec(function(err, resp) {
                if (err) {
                    res.send('Error running scan', err);
                } else {

                    res.send(resp);

                   
                }
            });
    });
router.route('/:id')
    .get(function(req, res) {
        Items

            .scan()
            .where('catalog').eq(req.params.id)
            .returnConsumedCapacity()

        .exec(function(err, resp) {
            if (err) {
                res.send('Error running scan', err);
            } else {

                res.send(resp);

            }
        });
    });
router.route('/items/all')
.get(function(req, res) {
    Items

        .scan()
        
        .returnConsumedCapacity()

    .exec(function(err, resp) {
        if (err) {
            res.send('Error running scan', err);
        } else {

            res.send(resp.Items);

           
        }
    });
})

