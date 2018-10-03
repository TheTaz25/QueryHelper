const mysql = require('mysql');
const config = require('./config');
const sql = require('./index0.js');

console.log(sql);

var poolConfig = Object.assign({}, config.sql);
poolConfig.connectionLimit = 10;

var pool = mysql.createPool(poolConfig);

let sub = new sql('Customers')
  .select(["Customers.CustomerName", "Orders.OrderID"])
  .r_join("Orders", "Customers.CustomerID=Orders.CustomerID");
// let query = new sql("Customers").select([{column: "CustomerName", alias: "Customer"}, {column: "ContactName", alias: "Contact Person"}]).getQueryString();
// let query = new sql("Customers")
//   .select(["Customers.CustomerName", "Orders.OrderID"])
//   .l_join("Orders", "Customers.CustomerID=Orders.CustomerID")
//   .union(sub, "CustomerName");
  // .order(["Customers.CustomerName"])
  // .getQueryString();
  //
// let query = new sql("Customers").select(["CustomerID", "Country"]).count("CustomerID").group(["Country"]).order(["CustomerID DESC"]).count("CustomerID").getQueryString();
// let query = new sql("Orders").select(["Shippers.ShipperName", {column: "Orders.OrderID", alias: "NumberOfOrders"}]).count("Orders.OrderID").l_join("Shippers", "Orders.ShipperID=Shippers.ShipperID").group(["ShipperName"]).getQueryString();
let query = new sql("Customers").select(["CustomerID", "Country"]).count("CustomerID").group(["Country"]).having("CustomerID > 5").count("CustomerID").order(["CustomerID DESC"]).count("CustomerID").getQueryString();
console.log(query);
pool.query(query, (error, results, fields) => {
  console.log(error);
  console.log(results.length);
  console.log(results);
  // console.log(error);
});

return 0;
