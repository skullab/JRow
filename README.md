![jRow.js](http://i43.tinypic.com/98xe84.png)
jRow ! Javascript data structure
================================

jRow.js is a library to create and display tables.
With jRow you can manage the data, insert, modify and delete like SQL style.

How to use
----------

+ Insert the script in the HEAD !

`<script src="js/jRow/jRow.js"></script>`

+ Create your own special script !

Example : Creates a table called 'contacts' with 3 fields : name , surname , phone

```javascript
var myTable = jRow.createTable('contacts',['name','surname','phone']);
```

+ Manage data !

Enter the data in the table

```javascript
myTable.insert({
    	phone:'05478',
		name:'John',
		surname:'Smith'
	}).insert({
    	name:'Paul',
    	surname:'Luap',
    	phone:'7845'
  }).insert({
    	name:'Mikye',
    	surname:'Mouse',
    	phone:'0123'
  });
```

+ Link table to `<div>` !

Create a `<div>` with id "my_contacts" and link graphic table to that !

```javascript
jRow.UI.link('my_contacts',myTable,{width:'33%',height:'200px'});
```

+ Prepare tables for display !

When you have created all your tables...let's show them !

```javascript
jRow.UI.prepare();
```

### Enjoyed the result !

![table example](http://i43.tinypic.com/2vazjo1.png)