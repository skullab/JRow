/*
 *	jRow.js Copyright (C) 2013 Ivan Maruca (ivan.maruca[at]gmail[dot]com)
 *
 *	Permission is hereby granted, free of charge, to any person obtaining a copy of this software 
 *	and associated documentation files (the "Software"), to deal in the Software without restriction, 
 *	including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, 
 *	and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, 
 *	subject to the following conditions:
 *
 *	The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 *	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, 
 *	INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, 
 *	FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. 
 *	IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, 
 *	DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, 
 *	OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 *			        ____                          
 *				 __/\  _`\                        
 *				/\_\ \ \L\ \    ___   __  __  __  
 *				\/\ \ \ ,  /   / __`\/\ \/\ \/\ \ 
 *			 	 \ \ \ \ \\ \ /\ \L\ \ \ \_/ \_/ \
 *				 _\ \ \ \_\ \_\ \____/\ \___x___/'
 *				/\ \_\ \/_/\/ /\/___/  \/__//__/  
 *				\ \____/                          
 *			 	 \/___/        
 * 
 *	T H E   J A V A S C R I P T   D A T A   S T R U C T U R E 
 */

(function(context) {
/* +----------------------------------------------------------------------------+
 * |							CONSTANTS										|
 * +----------------------------------------------------------------------------+
 * |	ACCESSIBILITY : PRIVATE													|
 * +----------------------------------------------------------------------------+
*/
	// SOFTWARE VERSIONING
	var VER_MAJOR = 0 ;
	var VER_MINOR = 1 ;
	var VER_REVISION = 1 ;
	
	var NOT_ASSIGNED = 'not_assigned';
	
/* +----------------------------------------------------------------------------+
 * |							JROW MODULE										|
 * +----------------------------------------------------------------------------+
 * |	ACCESSIBILITY : PUBLIC													|
 * +----------------------------------------------------------------------------+
*/
	
	context.jRow = {
		// current version of this software x.y [major.minor.revision]
		version : VER_MAJOR + '.' + VER_MINOR + '.' + VER_REVISION,
		// the root where it is installed
		root:''
	}

	context.jRow.createTable = createTable;
	context.jRow.Table = Table;

	// permission module
	context.jRow.permission = {
		editable : NOT_ASSIGNED,
		deletable : NOT_ASSIGNED,
		sortable : NOT_ASSIGNED,
		collapsable : NOT_ASSIGNED,
		exportable : NOT_ASSIGNED
	// TODO feature !
	}
	
/* +----------------------------------------------------------------------------+
 * |								CORE										|
 * +----------------------------------------------------------------------------+
 * |	ACCESSIBILITY : PRIVATE													|
 * +----------------------------------------------------------------------------+
*/

	// Main Table function
	function Table(title, header) {
		if (!isArray(header))
			throw new Error('ERROR : header is not a valid Array !');

		this.title = title;
		this.header = header;
		this.permission = context.jRow.permission;
		this.cols = header.length;
		this.rows = 0;
		this._id = -1;
		this.collections = {} ;

		for (key in header) {
			// console.log(header[key]);
			this[header[key]] = header[key];
		}

	}

	Table.prototype = {
		constructor : Table,
		insert : function(row) {
			this._id++;
			this.collections[this._id] = new Collection(this._id, row);
			return this;
		},
		update : function(newRow, where) {
			var result = this.getResult(where);
			for (n in result) {
				var row = result[n];
				for (key in newRow) {
					if (row[key] != 'undefined')
						row[key] = newRow[key];
				}
				this.collections[row._id] = row;
			}
		},
		erase : function(where) {
			var result = this.getResult(where) ;
			for(n in result){
				var row = result[n] ;
				delete this.collections[row._id] ;
			}
		},
		getResult : function(where) {
			var result = new Array();
			var check = false;
			
			if(where == null){
				result = this.collections ;
			}
			
			for (n in this.collections) {
				// console.log(this.collections[n]);
				var collection = this.collections[n];
				for (key in where) {
					if (collection[key] != 'undefined') {
						if (collection[key] == where[key]) {
							check = true;
						} else
							check = false;
					} else
						check = false;
				}

				if (check) {
					result.push(collection);
				}
			}

			return result;
		},
		getFirstRow : function(where) {
			return this.getResult(where)[0];
		}
	}

	// Collection data (single row)
	function Collection(id, row) {
		this._id = id;
		for (key in row) {
			this[key] = row[key];
		}
	}

	// create a new Table
	function createTable(title, header) {
		if (!isArray(header))
			throw new Error('ERROR : header is not a valid Array !');
		return new Table(title, header);
	}

	function isArray(obj) {
		return obj.constructor == Array;
	}
	
/* +----------------------------------------------------------------------------+
 * |							USER INTERFACE									|
 * +----------------------------------------------------------------------------+
 * |	ACCESSIBILITY : PUBLIC													|
 * +----------------------------------------------------------------------------+
 */
	context.jRow.UI = {
			link:link,
			prepare:prepare,
			invalidate:invalidate
	}
	
	context.jRow.UI.links = {} ;
	context.jRow.UI.tables = {} ;
	
/* +----------------------------------------------------------------------------+
 * |						USER INTERFACE CORE									|
 * +----------------------------------------------------------------------------+
 * |	ACCESSIBILITY : PRIVATE													|
 * +----------------------------------------------------------------------------+
*/
	function prepare(){
		if(window.addEventListener){
			window.addEventListener('load',invalidate,false);
		}else if(window.attachEvent){
			return window.addEventListener('onload',invalidate);
		}else throw new Error('ERROR : sorry but I can\'t prepare the user interface...\n try to add elements after enviroment is completely loaded');
	}
	
	function invalidate(){
		console.log('It\'s time to create UI !');
		for(id in context.jRow.UI.links){
			var div = document.getElementById(id);
			var table = context.jRow.UI.links[id] ;
			context.jRow.UI.tables[table.title] = new UiTable(div,table);
			context.jRow.UI.tables[table.title].draw();
		}
	}
	
	function link(divId,table){
		if(table instanceof Table){
			console.log('the table',table.title,'is instance of Table');
			context.jRow.UI.links[divId] = table ;
		}
	}
	
	function UiTable(div,table){
		this.div = div ;
		this.table = table ;
	}
	
	UiTable.prototype = {
		constructor:UiTable
	}
	
	UiTable.prototype.draw = function(){
		console.log('Drawing table :',this.table.title);
		var br = '<br>\n' ;
		var nl = '\n' ;
		var html = 
			'<div class="ui_table_title"> ' + this.table.title + ' </div>' + nl +
			'<table class="ui_table">' + nl + 
			'	<thead>' + nl + 
			'		{thead_content}' + nl + 
			'	</thead>' + nl +
			'	<tbody>' + nl +
			'		{tbody_content}' + nl +
			'	</tbody>' + nl +
			'	<tfoot>' + nl +
			'		<tr><td colspan="' + this.table.cols + '">{tfoot_content}</td></tr>' + nl +
			'	</tfoot>';
		
		var thead = '<tr>' ;
		var tbody = '' ;
		var tfoot = 'powered by jRow.js (c) 2013' ;
		
		for(var i in this.table.header){
			thead += '<th>' + this.table.header[i] + '</th>' ;
		}
		thead += '</tr>' ;
		
		for(var n in this.table.collections){
			var row = this.table.collections[n] ;
			tbody += '<tr>' ;
			for(var value in row){
				if(value != '_id'){
					tbody += '<td>' + row[value] + '</td>' ;
				}
			}
			tbody += '</tr>' ;
		}
		
		html = html.replace('{thead_content}',thead);
		html = html.replace('{tbody_content}',tbody);
		html = html.replace('{tfoot_content}',tfoot);
		
		this.div.innerHTML = html ;
	}
	
})(this);