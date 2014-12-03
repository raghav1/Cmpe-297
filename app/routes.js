module.exports = function(app) {
app.get('/', function(req, res) {
   var cwd = process.cwd();
        var indexFile = cwd + "/public/views/a.html";
        res.sendfile(indexFile);
   
});
var User = require("./models/user");
app.post('/authenticate', function(req, res) {
//TODO validate req.body.username and req.body.password
//if is invalid, return 401
var profile;
	User.findById(req.body, function(err, user) {
		//console.log("error"+err)
		if (err||err!=null) {
	    	
	        res.send(err);
	        return;
	    } else {
	    	
	        profile = user.data;
	        console.log(profile)
	        redirectUrl=""
	        if(user.data.usertype==0)
	        {	
	        	redirectUrl="/"

	        	
	        
		        res.json({
		            
		            redirectUrl:redirectUrl,
		            data:profile
		        });

	        }
	        else{
	        	redirectUrl="/admin/profile"
	        	
		        res.json({
		            
		            redirectUrl:redirectUrl,
		            data:profile
		        });
	        }
	        console.log(redirectUrl);
	        // We are sending the profile inside the token
	       
	    }
	});
});


app.get('/api/restricted', function(req, res) {
    console.log('user ' + req.user.username + ' is calling /api/restricted');
    res.json({
        name: 'foo'
    });
});
};