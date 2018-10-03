# QueryHelper

A simple script that helps you create valid SQL-Queries. Chain the functions together to create the Querystrings that you need!

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

You can request the final Query-String by calling `query.getQueryString()`

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
// --> SELECT * FROM table;
```

###### SELECT specific columns
To select specific columns pass an Array containing the columnnames in the `.select([columns])` function:
```js
const columns = ["col1", "col2", "col3"];
let query = new sql("table").select(columns);
// --> SELECT col1, col2, col3 FROM table;
```

###### SELECT DISTINCT
To perform a __SELECT DISTINCT__ simply pass a second paramter that has a positive value into the `.select([columns], distinct)` function:
```js
const columns = ["col1", "col2", "col3"];
let query = new sql("table").select(columns, true);
// --> SELECT DISTINCT col1, col2, col3 FROM table;
```

###### Alias in SELECT
To use aliases, transform the __Strings__ inside the Array into __Objects__ having a column attribute and an alias attribute; you can also mix the columns:
```js
const columns = ['col1',
{column: 'col2', alias: 'Fancy Name'},
{column: 'col3', alias: 'Unknown'}];
let query = new sql("table").select(columns);
// --> SELECT col1, col2 AS 'Fancy Name', col3 AS 'Unknown' FROM table;
```

### WHERE
To produce a __WHERE__ simply use the `.where(condition)` function:
```js
let query = new sql("table")
    .select()
    .where("condition > 5");
// --> SELECT * FROM table WHERE condition > 5
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
// --> SELECT * FROM table WHERE NOT condition > 5 AND col2=='Jimbo' OR NOT counter < 10;
```

###### WHERE IN
To make a __WHERE IN__ use the appropriate `.whereIn(condition, in, not)` function.
