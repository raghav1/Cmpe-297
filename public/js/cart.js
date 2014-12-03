var myApp = angular.module('myApp');
var Cart = myApp.factory('Cart', function($resource) {
	return $resource('/user/cart/:id', {
		id : '@_id'
	}, {

		update : {
			method : 'PUT'
		}
	});
});

myApp.factory('CartService', function() {
	console.log("hello");
	return {
		items : [],total:0
	};
});
myApp.controller('addToCartController', function($scope, Cart,CartService,$location) {
	$scope.id = -1;
	try{
		$scope.id =(JSON.parse(localStorage.data).id);
	}catch(err)
	{
		$location.path("/login");
	}
	
	
	$scope.init = function() {
		
		if(CartService.items.length==0){
			console.log("Called");
		var menuItems = Cart.get({
			id : $scope.id
		}, function() {
			console.log(menuItems);
			if(!(menuItems).message)
				{
			var items = JSON.parse(menuItems.cart.items);
			var item=menuItems.items;
			var cost=0.0;
			for(var i in items)
				{
				var name=items[i].item;
				for(var j in item)
					{
						if(item[j].name===name)
							{
							items[i].cost=item[j].cost;
							items[i].available=item[j].quantity;
							}
					
					}
				}
			$scope.cartItems = items;
			CartService.items=items;
			console.log(items);
				}
		});
		}else{
			$scope.cartItems =CartService.items;
		}
	};
	$scope.submitted = false;

	$scope.add = function() {
		var item = {
			opt : "add",
			item : "",
			quantity : 1,
			cost: 0
		};
		if ($scope.addToCart.$valid) {
			item = new Cart();
			item.opt="add";
			item.item = $scope.itemName;
			item.available=$scope.itemAvailable;
			
			item.quantity = $scope.qty;
			item.cost = parseFloat($scope.itemCost);
			var i={item : $scope.itemName,
			quantity: $scope.qty,
			cost : parseFloat($scope.itemCost),available:$scope.itemAvailable};
			//console.log(CartService.items);
			/*
			 * if($scope.cartItems.indexOf(cartItem.item)>=0) { alert('Item
			 * Already in cart'); } else{ $scope.cartItems.push(cartItem.item); }
			 */
			var exists=false;
			angular.forEach(CartService.items, function(cart) {
				if(cart.item===item.item)
					{
					alert("Item already in Cart");
					exists=true;
					}
				
			});
			if(!exists)
				{
				item.$update({ id: $scope.id },function(){
				
					CartService.items.push(i);
					$scope.updateScope();
				});
				}
		} else {
			$scope.addToCart.submitted = true;
		}
	};
$scope.updateScope=function()
{
	$scope.cartItems =CartService.items;
	console.log(CartService.items+"\t"+$scope.cartItems);
};
$scope.updateQuantity=function()
{
	if($scope.qty===$scope.oldqty)
		{
		alert("Change quantity before updating");
		}
	else{
		item = new Cart();
		item.opt="chngeQuantity";
		item.item =$scope.itemName;
		item.quantity=$scope.qty;
		var name=$scope.itemName;
		var qty=$scope.qty;
		item.$update({id:$scope.id},function(res){
		
			angular.forEach(CartService.items, function(cart) {
				console.log(cart.item+"\t"+name);
				if(cart.item===name)
					{
						cart.quantity=qty;
					
						$scope.updateScope();
						
					}
				
			});
		},function(err){
			console.log(err);
		});
	}
};
$scope.delete = function(name) {
	item = new Cart();
	item.opt="del";
	item.item =name;
	
	item.$update({id:$scope.id},function(){
		angular.forEach(CartService.items, function(cart) {
			console.log(cart.item+"\t"+name);
			if(cart.item===name)
				{
					CartService.items.splice((CartService.items.indexOf(cart)),1);
					$scope.updateScope();
				}
			
		});
	});
};
$scope.checkingOut=false;
$scope.toggle=function()
{
	$scope.checkingOut=!$scope.checkingOut;
};
$scope.checkout = function(name) {
	var it=[];
	angular.forEach(CartService.items, function(cart) {
		it.push({item:cart.item,quantity:cart.quantity,cost:cart.cost});
		
	});
	var item=new Cart();
	item.items=JSON.stringify(it);
	item.creditcard=$scope.cnumber;
	item.$save({id:$scope.id},function(res){
	
		CartService.items=[];
		$scope.updateScope();
		$location.path("/");
	});
};
});