var mysql =	require('mysql');
var db=require('/srv/www/cmpe282/shared/config/opsworks');
db.db.user="root";
db.db.multipleStatements=true;
var connectionpool = mysql.createPool(db.db);
module.exports =  connectionpool;

