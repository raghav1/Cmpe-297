/**
 * New node file
 */
angular.module('myApp.services',['ngResource']);
angular.module('myApp.services').factory('Catalog',function($resource){
	return $resource('/user/catalog');
});
angular.module('myApp.services').factory('ViewAll',function($resource){
	
	var abc= $resource('/user/items/all');
	
	return abc;
});
angular.module('myApp.services').factory('AddItem',function($resource){
	
	var abc= $resource('/admin/item');
	
	return abc;
});
angular.module('myApp.services').factory('AddCatalog',function($resource){
	
	var abc= $resource('/admin/catalog');
	
	return abc;
});
angular.module('myApp.services').factory('View',function($resource){
	return $resource('/user/:id', {
		id : '@_id'
	}, {

		update : {
			method : 'PUT'
		}
	});
});
angular.module('myApp.controllers',['ngSanitize']);
angular.module('myApp.controllers').
controller('CatalogController',['$scope','Catalog','View','$location','$routeParams','AddItem','AddCatalog','$route',function($scope,Catalog,View,$location,$routeParams,AddItem,AddCatalog,$route){
	var menuItems=Catalog.get(function(){
		$scope.menuItems=menuItems;
		
	});
	$scope.catalog=$routeParams.catalog;
	
	$scope.add=function()
	{
	var item = new AddItem({
            name: $scope.name,
            description: $scope.Description,
            catalog: $scope.catalog.name,
            quantity: $scope.quantity,
            cost: $scope.cost
        });
	AddItem.save(item, function(res) {
	    //data saved. do something here.
		alert(res.message);
		$location.path('/');
	  }); //saves an entry. Assuming $scope.entry is the Entry object  
		console.log($scope.Description+"\t"+$scope.cost+"\t"+$scope.quantity+"\t"+$scope.name+"\t"+$scope.catalog.name);
	}
	$scope.addCatalog=function()
	{
		var exists=false;
		
		for(i=0;i<$scope.menuItems.Items.length;i++)
			{
			if($scope.menuItems.Items[i].name.toUpperCase()===$scope.name.toUpperCase())
				{
				alert("Catalog of the same name already exists");
				exists=true;
				}
			}
		console.log(exists);
		if(!exists)
			{
			var item = new AddCatalog({
	            name: $scope.name,
	            description: $scope.Description
	         
	        });
			AddCatalog.save(item, function(res) {
			    //data saved. do something here.
				alert(res.message);
				$location.path('/');
				$route.reload();
			  });
			}
	}
	//console.log($routeParams);
	var menu=View.get({id:$scope.catalog},function(){
		$scope.sortorder = 'name';
		$scope.allItems=menu.Items;
		
		
	} ,function(error){
    if(error.status)
    	{
    	$location.path("/login");
    	}
        
	});
	
}]);
angular.module('myApp.controllers').
controller('ViewAllController',['$scope','ViewAll','$sce',function($scope,ViewAll,$sce){
	var menuItems=ViewAll.query(function(){
		$scope.sortorder = 'name';
		$scope.allItems=menuItems;
		//console.log(menuItems);
		
	});
}]);
angular.module('myApp.controllers').factory("user",function(){
    return {};
});
angular.module('myApp.controllers').
controller('ViewItemController',['$scope','$sce','user','$location',function($scope,$sce,user,$location){
	$scope.toggle=function(data){
		user.data=(data);
		$location.path("/detail");
      //  $scope.$apply();
	};
}]);
angular.module('myApp.controllers').
controller('ViewController',['$scope','$sce','user','$location',function($scope,$sce,user,$location){
	//console.log(user.data);
	if(user.data!=undefined)
		{
	var description= $sce.trustAsHtml(user.data.description);
	$scope.user=user.data;
	$scope.user.description=description;
		}
	else{
		$location.path("/");
	}
	//console.log($scope.user);
}]);

