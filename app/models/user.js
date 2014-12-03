var User = function(data) {
	this.data = data;
}
var pool = require(__dirname + '/../../db');

User.findById = function(data, callback) {
	pool
			.getConnection(function(err, connection) {

				connection
						.query(
								'SELECT * FROM users where username like "'
										+ data.username
										+ '" and password like "'
										+ data.password + '"',
								function(err, rows, fields) {
									if (err) {
										return callback(err);
									}
									if (rows.length > 0) {
										var query = 'Update users set lastlogin= NOW() where id= '
												+ parseInt(rows[0].id);

										connection.query(query, function(err,
												row, fields) {
											if (err) {
												return callback(err);
											}
										});
										callback(null, new User(rows[0]));

									} else {

										return callback({
											message : "Invalid Login"
										});
									}

									connection.release();
								});
			});

};
User.signup = function(data, callback) {
	pool.getConnection(function(err, connection) {
		var query = connection.query("INSERT INTO users set ? ", data,
				function(err, rows) {

					if (err)
						{return callback(err);}
					else
						{callback(null, rows);}

				});

	});
};
User.checkout = function(data, callback) {
	pool.getConnection(function(err, connection) {
		var query = connection.query("INSERT INTO transactions set ? ", data,
				function(err, rows) {

					if (err)
						{return callback(err);}
					else
						{callback(null, rows);}

				});

	});
};
module.exports = User;