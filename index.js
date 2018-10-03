class sql {
  constructor(table){
    if(table === undefined) throw new Error("Parameter not valid, string required!");
    if(table instanceof Array){
      let tmp = table.map(x => x.table + " AS '" + x.alias + "'");
      this.from = " FROM " + tmp.join(", ");
    } else {
      this.from = " FROM " + table;
    }
    this.whereString = "";
    this.orderBy = "";
    this.joins = "";
    this.groupBy = "";
    this.havingString = "";
    this.queryAddon = "";
    this.limiter = "";
    return this;
  }
  select(select, distinct){
    this.query = "";
    var isDistinct = distinct ? " DISTINCT" : "";
    var tmp = "";
    if(select == undefined) tmp = isDistinct+" *";
    else if(select instanceof Array && select.length === 0) tmp = isDistinct+" *";
    else if(select instanceof Array) {
      let sanitized = [];
      for(let c in select){
        if(select[c] instanceof Object){
          sanitized.push(select[c].column + " AS '" + select[c].alias + "'");
        } else {
          sanitized.push(select[c]);
        }
      }
      tmp = isDistinct + sanitized.join(", ");
    }
    if(tmp == "") throw new Error("Parameter not valid, it has to be either of 'undefined' or array containing strings!");
    this.query += " " + tmp;
    this.lastChange = "query";
    return this;
  }
  where(where, condition){
    if(condition === undefined) condition = "";
    var nope = condition.includes("!") ? " NOT " : " ";

    if(this.whereString === ""){
      this.whereString = " WHERE" + nope + where;
    } else {
      if(condition.includes("AND")){
        this.whereString += " AND" + nope + where;
      } else if(condition.includes("OR")){
        this.whereString += " OR" + nope + where;
      } else {
        console.warn("Condition can't be determined, not appending to where-clause");
      }
    }
    this.lastChange = "where";
    return this;
  }
  whereIn(where, sub, condition){
    var nope = condition.includes("!") ? " NOT " : " ";
    if(this.whereString === ""){
      if(sub instanceof Array){
        this.whereString = " WHERE " + where + nope + "IN ('" + sub.join("', '") + "')";
      } else if(sub instanceof sql){
        this.whereString = " WHERE " + where + nope + "IN (" + sub.getSubQueryString() + ")";
      } else {
        console.warn("2nd parameter has to be of type Array or sql!");
        return this;
      }
    } else {
      if(sub instanceof Array){
        this.whereString += " "
      } else if(sub instanceof sql){

      } else {
        console.warn("2nd parameter has to be of type Array or sql!");
        return this;
      }
    }
    this.lastChange = "where";
    return this;
  }
  whereAny(where, sub, condition){
    if(this.whereString != "" && condition === undefined){
      console.warn("condition missing");
      return this;
    }
    if(this.whereString === ""){
      this.whereString = " WHERE " + where + " ANY (" + sub.getSubQueryString() + ")";
    } else {
      this.whereString += " " + condition + " " + where + " ANY (" + sub.getSubQueryString() + ")";
    }
    this.lastChange = "where";
    return this;
  }
  whereAll(where, sub, condition) {
    if(this.whereString != "" && condition === undefined){
      console.warn("condition missing");
      return this;
    }
    if(this.whereString === ""){
      this.whereString = " WHERE " + where + " ALL (" + sub.getSubQueryString() + ")";
    } else {
      this.whereString += " " + condition + " " + where +  " ALL (" + sub.getSubQueryString() + ")";
    }
    this.lastChange = "where";
    return this;
  }
  i_join(table, matcher){
    this.joins += " INNER JOIN " + table + " ON " + matcher;
    return this;
  }
  l_join(table, matcher){
    this.joins += " LEFT JOIN " + table + " ON " + matcher;
    return this;
  }
  r_join(table, matcher){
    this.joins += " RIGHT JOIN " + table + " ON " + matcher;
    return this;
  }
  f_join(table, matcher){
    this.joins += " FULL OUTER JOIN " + table + " ON " + matcher;
    return this;
  }
  order(order){
    if(order === undefined) return this;
    if(order instanceof Array) {
      this.orderBy = " ORDER BY " + order.join(", ");
    } else {
      console.warn("Parameter has to be an Array containing of strings!");
    }
    this.lastChange = "order";
    return this;
  }
  union(query, order, all){
    if(query instanceof sql){
      all = all ? "ALL " : ""
      let union = "(" + this.getSubQueryString() + ") UNION (" + all + query.getSubQueryString() + ")";
      if(order){
        order = " ORDER BY " + order;
      }
      return union + order + ";";
    }
    return new Error("1st and 2nd parameter has to be of class sql!");
  }
  //select, order, having
  min(column, alias){
    let as = alias ? " AS [" + alias + "]" : "";
    let lastChanged = this.getLastChanged();
    let tmp = lastChanged.split(" ");
    let target = checkString(tmp, column);
    if(target === undefined) {
      console.warn("String not found, continuing");
      return this;
    }
    let comma = tmp[target].includes(",") ? "," : "";
    tmp[target] = "MIN(" + column + ")" + as + comma;
    this.changeLastChanged(tmp.join(" "));
    return this;
  }
  max(column, alias) {
    let as = alias ? " AS [" + alias + "]" : "";
    let lastChanged = this.getLastChanged();
    let tmp = lastChanged.split(" ");
    let target = checkString(tmp, column);
    if(target === undefined){
      console.warn("String not found, continuing");
      return this;
    }
    let comma = tmp[target].includes(",") ? "," : "";
    tmp[target] = "MAX(" + column + ")" + as + comma;
    this.changeLastChanged(tmp.join(" "));
    return this;
  }
  avg(column, alias) {
    let as = alias ? " AS [" + alias + "]" : "";
    let lastChanged = this.getLastChanged();
    let tmp = lastChanged.split(" ");
    let target = checkString(tmp, column);
    if(target === undefined){
      console.warn("String not found, continuing");
      return this;
    }
    let comma = tmp[target].includes(",") ? "," : "";
    tmp[target] = "AVG(" + column + ")" + as + comma;
    this.changeLastChanged(tmp.join(" "));
    return this;
  }
  count(column, alias) {
    let as = alias ? " AS [" + alias + "]" : "";
    let lastChanged = this.getLastChanged();
    let tmp = lastChanged.split(" ");
    let target = checkString(tmp, column);
    if(target === undefined){
      console.warn("String not found, continuing");
      return this;
    }
    let comma = tmp[target].includes(",") ? "," : "";
    tmp[target] = "COUNT(" + column + ")" + as + comma;
    this.changeLastChanged(tmp.join(" "));
    return this;
  }
  sum(column, alias){
    let as = alias ? " AS [" + alias + "]" : "";
    let lastChanged = this.getLastChanged();
    let tmp = lastChanged.split(" ");
    let target = checkString(tmp, column);
    if(target === undefined){
      console.warn("String not found, continuing");
      return this;
    }
    let comma = tmp[target].includes(",") ? "," : "";
    tmp[target] = "SUM(" + column + ")" + as + comma;
    this.changeLastChanged(tmp.join(" "));
    return this;
  }
  group(columns){
    var tmp = "";
    if(!columns instanceof Array && !columns instanceof String){
      console.warn("Grouping: paramter not of type array or string!");
      return this;
    }
    if(columns instanceof String){
      tmp = columns;
    } else {
      tmp = columns.join(", ");
    }
    this.groupBy = " GROUP BY " + tmp;
    this.lastChange = "group";
    return this;
  }
  having(condition){
    this.havingString = " HAVING " + condition;
    this.lastChange = "having";
    return this;
  }
  top(num, percentage){
    const percent = percentage ? " PERCENT" : "";
    this.queryAddon = " TOP " + num + percent;
    return this;
  }
  limit(num){
    this.limiter = " LIMIT " + num;
    return this;
  }
  getQueryString(){
    return "SELECT" + this.queryAddon + this.query + this.from + this.whereString + this.joins + this.groupBy + this.havingString + this.orderBy + this.limiter + ";";
  }
  getSubQueryString(){
    return "SELECT" + this.queryAddon + this.query + this.from + this.whereString + this.joins + this.groupBy + this.havingString + this.orderBy + this.limiter;
  }
  getLastChanged(){
    switch(this.lastChange){
      case 'query': return this.query;
      case 'where': return this.whereString;
      case 'order': return this.orderBy;
      case 'group': return this.groupBy;
      case 'having': return this.havingString;
    }
  }
  changeLastChanged(value){
    switch(this.lastChange){
      case 'query':
        this.query = value;
        break;
      case 'where':
        this.whereString = value;
        break;
      case 'order':
        this.orderBy = value;
        break;
      case 'group':
        this.groupBy = value;
        break;
      case 'having':
        this.havingString = value;
    }
    return;
  }
}
// check if substring in array is surrounded by parenthesis (then skip it) and if it has a comma;
// return array of matching index
function checkString(arr, matcher){
  for(var i = 0; i < arr.length; i++){
    if(arr[i].includes("("+matcher+")")) continue;
    if(arr[i] === matcher) return i;
    if(arr[i] === matcher + ",") return i;
  }
  return undefined;
}

//export default sql;
// var columns = ["test", "users", "password", "usersaccount", "users"];
// var orders = ["users DSC", "password ASC"];
// var grouping = ["users", "usersaccount"];
// var subQuery = new sql("countries").select(["countries"]).where("continent=europe");
//Select [] from table
// var test = new sql("pqa").select();
// Select Distinct!
//var test = new sql("test").select(columns, true);
//single where clause
// var test = new sql("test").select(columns).where("users>=4");
// single where clause with NOT
// var test = new sql("test").select(columns).where("users>=4", "!");
// multi-where with AND
// var test = new sql("test").select(columns).where("users>=4").where("password LIKE meh", "AND");
//multi-where with OR
// var test = new sql("test").select(columns).where("users>=4").where("test=true", "OR");
//multi-where with NOT AND
// var test = new sql("test").select(columns).where("users>=4").order(orders).where("test=false", "!AND");
// order by one
// var test = new sql("test").select(columns).order(["users DSC"]);
// order by multiple
// var test = new sql("test").select(columns).order(orders);
// where in with array
// var test = new sql("test").select().whereIn("countries", orders, "x");
// where in with subquery
// var test = new sql("test").select().whereIn("countries", subQuery);
// joins
// var test = new sql("test").select(["test.id", "join.mission"]).i_join("join", "test.id=join.id");
// unions with order and all trigger
// var test = new sql("test").select().union(subQuery, "countries ASC", 1);
// apply min/max/avg/sum/count on a select statement
// var test = new sql("test").select(columns).min("users").max("users");
// grouping
// var test = new sql("test").select(columns).order(orders).group(grouping);
// having
// var test = new sql("test").select(columns).count("test").group(grouping).having("test > 5").count("test");
// test = test.getQueryString();
// console.log(test);

module.exports = sql;
