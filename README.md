# QueryHelper

A simple script that helps you create valid SQL-Queries. Chain the functions together to create the Querystrings that you need without loosing track!

## Install
```sh
npm install queryhelper
```

## Usage
Create a query by simply invoking a new sql object:
```js
const sql = require('queryhelper');

let query = new sql("table").select();
```

# __You can request the final Query-String by calling `query.getQueryString()`__

### Instantiate
When creating a new sql-Object pass over the tablename you want to query for.
```js
// First Instantiation
let query = new sql("table");
```

### SELECT
By simply calling `.select()` all Columns will be selected in the Query:
```js
let query = new sql("table").select();
```
```sql
SELECT * FROM table;
```

###### SELECT specific columns
To select specific columns pass an Array containing the columnnames in the `.select([columns])` function:
```js
const columns = ["col1", "col2", "col3"];
let query = new sql("table").select(columns);
```
```sql
SELECT col1, col2, col3 FROM table;
```

###### SELECT DISTINCT
To perform a __SELECT DISTINCT__ simply pass a second paramter that has a positive value into the `.select([columns], distinct)` function:
```js
const columns = ["col1", "col2", "col3"];
let query = new sql("table").select(columns, true);
```
```sql
SELECT DISTINCT col1, col2, col3 FROM table;
```

###### Alias in SELECT
To use aliases, transform the __Strings__ inside the Array into __Objects__ having a column attribute and an alias attribute; you can also mix the columns:
```js
const columns = ['col1',
{column: 'col2', alias: 'Fancy Name'},
{column: 'col3', alias: 'Unknown'}];
let query = new sql("table").select(columns);
```
```sql
SELECT col1, col2 AS 'Fancy Name', col3 AS 'Unknown' FROM table;
```

### WHERE
To produce a __WHERE__ simply use the `.where(condition)` function:
```js
let query = new sql("table")
    .select()
    .where("condition > 5");
```
```sql
SELECT * FROM table WHERE condition > 5;
```

###### Chaining WHERE-clauses
To achieve multiple __WHERE__ just chain multiple `.where(condition, operator)` where operator denotes the chain-condition. Valid operator-values are: **AND**, **OR**, **!AND**, **!OR**.
The exclamation point causes the **AND/OR** to transform into **AND/OR NOT**:
```js
let query1 = new SQL("table")
    .select()
    .where("condition > 5", "!")
    .where("col2=='Jimbo'", "AND")
    .where("counter < 10", "!OR");
```
```sql
SELECT * FROM table WHERE NOT condition > 5 AND col2=='Jimbo' OR NOT counter < 10;
```

###### WHERE IN
To make a __WHERE IN__ use the appropriate `.whereIn(column, in, operator)` function. The in parameter can be either an Array containing values or another sql instance. The operator parameter is again used for chaining and can again accept following values: __AND__, __OR__, __!AND__, __!OR__ :
```js
// Using an Array of values
const values = ["val1", "val2"];
let query = new sql("table")
    .select()
    .whereIn("column", values);
```
```sql
SELECT * FROM table WHERE column IN ('val1'. 'val2');
```
```js
// Using a subquery
let sub = new sql("anothertable").select(["column"]);
let query = new sql("table")
    .select()
    .whereIn("column", sub);
```
```sql
SELECT * FROM table WHERE column IN (SELECT column FROM anothertable);
```

###### WHERE ANY / ALL
To query with __WHERE condition > ANY ...__ or __WHERE condition > ALL ...__ use the appropriate `.whereAny(condition, sub, operator)` or `.whereAll(condition, sub, operator)` function. In those functions __sub__ can only be of type sql. Do not forget to embed a comparison  operator into the condition (like <, >, =, etc):
```js
let sub = new sql("table").select(["column"]);
let query = new sql("table")
    .select()
    .whereAny("condition >", sub);
```
```sql
SELECT * FROM table WHERE condition > ANY (SELECT column FROM table);
```

### JOINS
There are 4 functions to create joins: `.i_join(table, matcher)` _to create an inner join_, `.l_join(table, matcher)` _to create a left join_, `.r_join(table, matcher)` _to create a right join_ and `.f_join(table, matcher)` _to create a full outer join_. Please check if your database supports Full Outer Joins (Tested under MySQL 5.7 --> Full Outer Join does not work!):
```js
let query = new sql("table")
    .select()
    .l_join("table2", "table.id=table2.id");
```
```sql
SELECT * FROM table LEFT JOIN tabl2 ON table.id=table2.id;
```

### ORDER BY
To add an __ORDER BY__ statement simply chain the `.order(columns)` function, the parameter columns has to be an Array of strings containing the columns to order. You can add _ASC_ order _DESC_ to the Strings in the Array to change the order direction:
```js
const order = ["col1 ASC", "col2 DESC"];
let query = new sql("table")
    .select()
    .order(order);
```
```sql
SELECT * FROM table ORDER BY col1 ASC, col2 DESC;
```

### GROUPS and HAVING
__GROUP BY__ and __HAVING__ are also straightforward to apply by using the functions `.group(columns)` and `.having(condition)` where the columns parameter can be an Array or a single String and the condition parameter a string:
```js
let query = new sql("table")
    .select()
    .group(["col1", "col2"])
    .having("col1 > 5");
```
```sql
SELECT * FROM table GROUP BY col1, col2 HAVING col1 > 5;
```

### Functions AVG, MIN, MAX, COUNT, SUM
QueryHelper gives the opportunity to use the SQL-Functions `SUM()`, `AVG()`, `COUNT()`, `MIN()`, `MAX()` by using the appropriate lowercase functions from the sql-class. Chain these functions after a `.select()`, `.where()`, `.order()`, `.group()`, or `.having()` call to change the appropriate part of the query. For this, pass as first parameter the column that should be enclosed by the SQL-Function and as a second optional parameter an alias.
You can also chain multiple SQL-Functions with different rows to extend this even more:
```js
let query = new sql("table")
    .select(["col1", "col2"])
    .min("col1", "Minimum")
    .max("col2", "Maximum");
```
```sql
SELECT MIN(col1), MAX(col2) FROM table;
```
```js
const columns = ["test", "users", "password", "useraccount", "users"];
const grouping = ["users", "useraccount"];
let query = new sql("table")
    .select(columns)
    .count("users")
    .group(grouping)
    .having("users > 5")
    .count("users");
```
```sql
SELECT test, COUNT(users), password, useraccount, users FROM table GROUP BY users, useraccount HAVING COUNT(users) > 5;
```

### UNIONS
Currently it is only possible to __UNION__ two subqueries together and receive the final UNION-Querystring. Simply apply `.union(query, order, all)` at the very end of the sql-chain.
__query__ is the second query that should be unioned with the first sql-object. __order__ applies an additional __ORDER BY__ to the union and the __all__ parameter applies an "ALL" to the UNION if the parameter has a positive value:
```js
let subquery = new sql("countries").select().where("continent=europe");
// running union causes to return the final string instead of the sql-object!!!
let query = new sql("test").select().union(subquery, "countries ASC", true);
```
```sql
(SELECT * FROM test) UNION ALL (SELECT * FROM countries WHERE continent='europe') ORDER BY countries ASC;
```

### TOP
To achieve an __SELECT TOP__ use `.top(number, percentage)` where the percentage parameter causes to add "PERCENT" to the top-string;

### LIMIT and OFFSET
Limiting the query can be made by using the `.limit(limit, offset)` function.






.
