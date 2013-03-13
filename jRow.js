/*
 *	jRow.js Copyright (C) 2013 Ivan Maruca (ivan.maruca[at]gmail[dot]com)
 *	http://skullab.com
 *
 *	jRow.js is released under MIT LICENSE
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
 *					____                          
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

if(typeof JROW_CONTEXT === 'undefined'){JROW_CONTEXT = (this.window || this) ;};
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
	var VER_REVISION = 3 ;
	
	var NOT_ASSIGNED = 'not_assigned';
	
/* +----------------------------------------------------------------------------+
 * |							JROW MODULE										|
 * +----------------------------------------------------------------------------+
 * |	ACCESSIBILITY : PUBLIC													|
 * +----------------------------------------------------------------------------+
*/
	
	context.jRow = {
		// current version of this software [major.minor.revision]
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
			invalidate:invalidate,
			collapseTable:collapseTable,
			expandTable:expandTable
	}
	
	context.jRow.UI.links = {} ;
	context.jRow.UI.layouts = {} ;
	context.jRow.UI.tables = {} ;
	
	context.jRow.UI.CSS_FILENAME = 'jRowStyle' ;
	context.jRow.UI.CSS_TITLE = 'jrow_stylesheet' ;
	context.jRow.UI.WIDTH = 'width' ;
	context.jRow.UI.HEIGHT = 'height' ;
	context.jRow.UI.LIMIT = 'limit' ;
	context.jRow.UI.ARROW_COLLAPSE = 'arrow_collapse.png' ;
	context.jRow.UI.ARROW_EXPAND = 'arrow_expand.png' ;
	
/* +----------------------------------------------------------------------------+
 * |						USER INTERFACE CORE									|
 * +----------------------------------------------------------------------------+
 * |	ACCESSIBILITY : PRIVATE													|
 * +----------------------------------------------------------------------------+
*/
	function prepare(){
		
		var css = document.createElement('link');
		css.rel = 'stylesheet' ;
		css.type = 'text/css' ;
		css.href = './css/' + context.jRow.UI.CSS_FILENAME + '.css' ;
		css.title = context.jRow.UI.CSS_TITLE ;
		
		document.getElementsByTagName('head')[0].appendChild(css);
		
		if(window.addEventListener){
			window.addEventListener('load',invalidate,false);
		}else if(window.attachEvent){
			return window.addEventListener('onload',invalidate);
		}else throw new Error('ERROR : sorry but I can\'t prepare the user interface...\n try to add elements after enviroment is completely loaded');
	}
	
	function invalidate(reference){
		console.log('It\'s time to create UI !');
		
		if(reference instanceof context.jRow.Table){
			context.jRow.UI.tables[reference.title].draw();
			context.jRow.UI.tables[reference.title].configure();
			return ;
		}
		
		for(var id in context.jRow.UI.links){
			var div = document.getElementById(id);
			var table = context.jRow.UI.links[id] ;
			context.jRow.UI.tables[table.title] = new UiTable(div,table);
			context.jRow.UI.tables[table.title].draw();
			context.jRow.UI.tables[table.title].configure();
		}
	}
	
	function link(divId,table,settings){
		if(table instanceof Table){
			console.log('the table',table.title,'is instance of Table');
			context.jRow.UI.links[divId] = table ;
			if(settings != null && typeof settings == 'object'){
				context.jRow.UI.layouts[divId] = settings ;
			}
		}
	}
	
	function collapseTable(table){
		
	}
	
	function expandTable(table){
		
	}
	
	function configure(){
		var id = this.div.getAttribute('id');
		var settings = context.jRow.UI.layouts[id];
		var tableElement = document.getElementById(id+'_table');	
		
		for(var i = 0 ; i < this.table.cols ; i++){
			if( 'col'+i in settings){
				var id = this.table.title + '_col_' + i ;
				var col = document.getElementById(id);
				console.log(col);
				col.style.width = settings['col'+i] ;
			}
			
		}
		
		for(var option in settings){
			switch(option){
			case 'width':
				this.div.style.width = settings[option] ;
				//tableElement.style.width = settings[option];
				break;
			case 'height':
				this.div.style.height = settings[option] ;
				break;
			case 'onRowClick':
				if(typeof settings[option] == 'function'){
					this.onRowClick = settings[option] ;
				}
				break;
			}
		}
	}
	
	function getStyle(el, rule){
		var value = "";
		if(document.defaultView && document.defaultView.getComputedStyle){
			value = document.defaultView.getComputedStyle(el, "").getPropertyValue(rule);
		}
		else if(el.currentStyle){
			rule = rule.replace(/\-(\w)/g, function (match, p1){
				return p1.toUpperCase();
			});
			value = el.currentStyle[rule];
		}
		return value;
	}
	
	function UiTable(div,table){
		this.div = div ;
		this.table = table ;
	}
	
	UiTable.prototype = {
		constructor:UiTable,
		configure:configure
	}
	
	UiTable.prototype.draw = function(){
		console.log('Drawing table :',this.table.title);
		var br = '<br>\n' ;
		var nl = '\n' ;
		var html = 
			'<div class="ui_table_title"> <img id="' + this.div.getAttribute('id') + '_arrow" src="./images/' + 
			context.jRow.UI.ARROW_COLLAPSE + '" style="vertical-align:middle;" > ' + this.table.title + 
			'<img src="./images/jrow_title_ad.png" align="right"></div>' + nl +
			'<table id="'+this.div.getAttribute('id')+'_table" class="ui_table" collapsed="true">' + nl +
			'	{colgroup}' + nl +
			'	<thead>' + nl + 
			'		{thead_content}' + nl + 
			'	</thead>' + nl +
			'	<tbody>' + nl +
			'		{tbody_content}' + nl +
			'	</tbody>' + nl +
			'	<tfoot>' + nl +
			'		<tr><td colspan="' + this.table.cols + '">{tfoot_content}</td></tr>' + nl +
			'	</tfoot>';
		
		var colgroup = '' ;
		var thead = '<tr>' ;
		var tbody = '' ;
		var tfoot = 'powered by jRow.js (c) 2013' ;
		
		// COLGROUP
		for(var i = 0 ; i < this.table.cols ; i++){
			var col = '<col id="'+this.table.title+'_col_'+i+'">' ;
			colgroup += col + nl;
		}
		// THEAD
		for(var i in this.table.header){
			thead += '<th>' + this.table.header[i] + '</th>' ;
		}
		thead += '</tr>' ;
		
		// TBODY
		for(var n in this.table.collections){
			var row = this.table.collections[n] ;
			tbody += '<tr id="' + this.div.getAttribute('id') + '_table_row_' + n + '">' ;
			for(var value in row){
				if(value != '_id'){
					tbody += '<td>' + row[value] + '</td>' ;
				}
			}
			tbody += '</tr>' ;
		}
		
		html = html.replace('{colgroup}',colgroup);
		html = html.replace('{thead_content}',thead);
		html = html.replace('{tbody_content}',tbody);
		html = html.replace('{tfoot_content}',tfoot);
		
		this.div.innerHTML = html ;
		
		var id = this.div.getAttribute('id') ;
		var _this = this ;
		
		for(var n in this.table.collections){
			var r = document.getElementById(id+'_table_row_'+n);
			r.setAttribute('ID',n);
			r.onclick = function(){
				var id = this.getAttribute('ID') ;
				var result = _this.table.getResult({_id:id});
				_this.onRowClick(result[0]);
			}
		}
		
		var arrow = document.getElementById(id+'_arrow');
		var table = document.getElementById(id+'_table');
		arrow.onclick = function(){
			var collapsed = table.getAttribute('collapsed');
			if(collapsed){
				this.src = './images/' + context.jRow.UI.ARROW_EXPAND ;
				table.style.display = 'none' ;
				table.setAttribute('collapsed','');
				
			}else{
				this.src = './images/' + context.jRow.UI.ARROW_COLLAPSE ;
				table.style.display = 'block' ;
				table.setAttribute('collapsed','true');
			}
		}
	}
	
})(JROW_CONTEXT);