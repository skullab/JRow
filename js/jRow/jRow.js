/*
 *	jRow.js Copyright (C) 2013 Ivan Maruca (ivan.maruca[at]gmail[dot]com)
 *	http://skullab.com
 *
 *	jRow.js (C) is released under MIT LICENSE
 *
 *	Permission is hereby granted, free of charge, to any person obtaining a copy of this software 
 *	and associated documentation files (the "Software"), to deal in the Software without restriction, 
 *	including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, 
 *	and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, 
 *	subject to the following conditions:
 *
 *	The above copyright notice and this permission notice 
 *	shall be included in all copies or substantial portions of the Software.
 *
 *	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, 
 *	INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, 
 *	FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. 
 *	IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, 
 *	DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, 
 *	OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 *					 ____                          
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

if (typeof JROW_CONTEXT === 'undefined') {
	JROW_CONTEXT = (this.window || this);
};
(function(context) {
	/*
	 * +----------------------------------------------------------------------------+ 
	 * |CONSTANTS																	|
	 * +----------------------------------------------------------------------------+ 
	 * |ACCESSIBILITY : PRIVATE 													|
	 * +----------------------------------------------------------------------------+
	 */
	// SOFTWARE VERSIONING
	var VER_MAJOR = 0;
	var VER_MINOR = 2;
	var VER_REVISION = 3;
	var JROW_FILENAME = 'jRow.js' ;
	var NOT_ASSIGNED = 'not_assigned';

	/*
	 * +----------------------------------------------------------------------------+ 
	 * |JROW MODULE																	|
	 * +----------------------------------------------------------------------------+ 
	 * |ACCESSIBILITY : PUBLIC 														|
	 * +----------------------------------------------------------------------------+
	 */

	context.jRow = {
		// current version of this software [major.minor.revision]
		version : VER_MAJOR + '.' + VER_MINOR + '.' + VER_REVISION,
		// the root where it is installed
		root : (function(){
			var scripts = document.getElementsByTagName('script');
			for(var i = 0 ; i < scripts.length ; i++){
				var script = scripts[i] ;
				var path = script.src.split('/');
				var file = path[path.length-1];
				if(file == JROW_FILENAME){
					path.pop();
					path = path.join('/');
					return path ;
				}
			}
			return '' ;
		})()
	}

	context.jRow.createTable = createTable;
	context.jRow.Table = Table;
	context.jRow.join = join;

	// permission module
	context.jRow.permission = {
		editable : NOT_ASSIGNED,
		deletable : NOT_ASSIGNED,
		sortable : NOT_ASSIGNED,
		collapsable : NOT_ASSIGNED,
		exportable : NOT_ASSIGNED
	// TODO feature !
	}

	/*
	 * +----------------------------------------------------------------------------+
	 * |CORE																		|
	 * +----------------------------------------------------------------------------+ 
	 * |ACCESSIBILITY : PRIVATE														|
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
		this.collections = {};

		for (key in header) {
			// console.log(header[key]);
			this[header[key]] = header[key];
		}

	}

	Table.prototype = {
		constructor : Table,
		insert : function(row) {
			this._id++;
			var check = false;
			var rowCounter = 0;
			for ( var key in row) {
				rowCounter++;
				for ( var i in this.header) {
					if (key == this.header[i]) {
						check = true;
						break;
					}
					check = false;
				}
				if (!check) {
					delete row[key];
					rowCounter--;
				}
			}
			check = (this.cols == rowCounter) ? true : false;
			// console.log(check,row,rowCounter);
			if (check) {
				row = getOrderRow(row, this.header);
				this.collections[this._id] = new Collection(this._id, row);
				this.rows++;
			}else{
				return {error:true,insert:function(){
					throw new Error('jRow Exception : Previous insert is not successful !');
				}};
			}
			return this;
		},
		update : function(newRow, where) {

			var result = this.getResult(where);
			// var order = getOrderRow(newRow,this.header);
			var safeHeader = this.header;

			for ( var n in result) {
				var row = result[n];
				var id = row._id;
				// console.log('result number',n,':',row);
				var position = this.cols;

				for ( var key in newRow) {
					if (row[key]) {
						row[key] = newRow[key];
						position = getPosition(row[key], row);
					} else {
						// console.log('add',key,position,this.cols);
						if (!inArray(key, this.header)) {
							this.header.splice(position, 0, key);
							this.cols = this.header.length;
						}
						row[key] = newRow[key];
					}
				}

				row = getOrderRow(row, safeHeader);
				// console.log('after update number',n,'result :',row);
				this.collections[row._id] = new Collection(row._id, row);
				// console.log(this.collections[row._id]);
			}
			
			return this;
		},
		erase : function(where) {
			var result = this.getResult(where);
			for ( var n in result) {
				var row = result[n];
				delete this.collections[row._id];
			}
		},
		getResult : function(where) {
			var result = new Array();
			var check = false;

			if (where == null) {
				result = this.collections;
			}

			for ( var n in this.collections) {
				// console.log(this.collections[n]);
				var collection = this.collections[n];
				for ( var key in where) {
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
		},
		bound : function(value) {
			value = value || '';
			for ( var n in this.collections) {
				var row = this.collections[n];
				for ( var i in this.header) {
					var key = this.header[i];
					row[key] = (typeof row[key] != 'undefined') ? row[key]
							: value;
				}
				row = getOrderRow(row, this.header);
				this.collections[n] = new Collection(row._id, row);
				// console.log(this.collections[n]);
			}
		}
	}

	function getPosition(value, obj) {
		var n = 0;
		for ( var key in obj) {
			if (value === obj[key]) {
				return n;
			} else
				n++;
		}
		return -1;
	}

	function inArray(value, arr) {
		for ( var i = 0; i < arr.length; i++) {
			if (value === arr[i]) {
				return true;
			}
		}
		return false;
	}

	function getOrderRow(row, header) {
		var orderRow = {};
		if (row._id >= 0)
			orderRow._id = row._id;
		for ( var i in header) {
			var key = header[i];
			if (row[key] != 'undefined') {
				orderRow[key] = row[key];
			}
		}
		return orderRow;
	}
	// Collection data (single row)
	function Collection(id, row) {
		this._id = id;
		for ( var key in row) {
			this[key] = row[key];
		}
	}

	// create a new Table
	function createTable(title, header) {
		if (!isArray(header))
			throw new Error('ERROR : header is not a valid Array !');
		return new Table(title, header);
	}

	/**
	 * Join tables and return a new table ! Table
	 * join('Title',table1,table2,...,tableX, optional [col1,col2...])
	 */
	function join() {
		var title = [].shift.call(arguments);
		if (typeof title != 'string')
			throw new Error('jRow Join error : Title is not set !');
		var header = isArray(arguments[arguments.length - 1]) ? [].pop
				.call(arguments) : [];
		var concatHeader = (header.length == 0) ? true : false;
		var max = 0;
		//console.log(header, arguments);
		for ( var i = 0; i < arguments.length; i++) {
			var table = arguments[i];
			if (table instanceof context.jRow.Table) {
				var _title = (table.title == '' || table.title == null) ? i
						: table.title;
				if (concatHeader)
					header = header
							.concat(headerTableName(_title, table.header));
				max = Math.max(max, table.rows);
			}
		}
		//console.log(header, max);
		var joinTable = createTable(title, header);

		for ( var i = 0; i < max; i++) {
			var rr = {};

			for ( var n = 0; n < arguments.length; n++) {
				var table = arguments[n];
				var r = table.getFirstRow({
					_id : i
				});
				//console.log(r);
				for ( var h in header) {
					var key = header[h];
					var sKey = key.split('.')[1];
					var titleTable = key.split('.')[0];
					if (r != undefined
							&& (table.title == titleTable || (table.title == '' && titleTable == n)))
						rr[key] = r[sKey];

				}
			}
			var c = new Collection(i, rr);
			//console.log(i, rr, c);
			joinTable.collections[i] = c;
			joinTable.bound();
		}

		joinTable._id = max - 1 ;
		joinTable.rows = max ;
		//console.log(joinTable);
		return joinTable;
	}

	function headerTableName(title, header) {
		var titleHeader = [];
		for ( var i in header) {
			titleHeader[i] = title + '.' + header[i];
		}
		return titleHeader;
	}

	function verifyArray(obj) {
		return (isArray(obj) ? {
			verify : true,
			object : obj
		} : {
			verify : false,
			object : obj
		});
	}

	function isArray(obj) {
		if (obj == undefined)
			return false;
		return obj.constructor == Array;
	}

	/*
	 * +----------------------------------------------------------------------------+ 
	 * |USER INTERFACE 																|
	 * +----------------------------------------------------------------------------+ 
	 * |ACCESSIBILITY : PUBLIC 														|
	 * +----------------------------------------------------------------------------+
	 */
	context.jRow.UI = {
		link : link,
		prepare : prepare,
		invalidate : invalidate,
		postInvalidate : postInvalidate
	}

	context.jRow.UI.links = {};
	context.jRow.UI.layouts = {};
	context.jRow.UI.tables = {};

	context.jRow.UI.CSS_FILENAME = 'jRowStyle';
	context.jRow.UI.CSS_TITLE = 'jrow_stylesheet';
	context.jRow.UI.WIDTH = 'width';
	context.jRow.UI.HEIGHT = 'height';
	context.jRow.UI.LIMIT = 'limit';
	context.jRow.UI.ARROW_COLLAPSE = 'arrow_collapse.png';
	context.jRow.UI.ARROW_EXPAND = 'arrow_expand.png';

	/*
	 * +----------------------------------------------------------------------------+ 
	 * |USER INTERFACE CORE 														|
	 * +----------------------------------------------------------------------------+ 
	 * |ACCESSIBILITY : PRIVATE 													|
	 * +----------------------------------------------------------------------------+
	 */
	var WINDOW_LOADED = false;

	function prepare() {

		var css = document.createElement('link');
		css.rel = 'stylesheet';
		css.type = 'text/css';
		css.href = context.jRow.root +'/css/' + context.jRow.UI.CSS_FILENAME + '.css';
		css.title = context.jRow.UI.CSS_TITLE;

		document.getElementsByTagName('head')[0].appendChild(css);

		if (window.addEventListener) {
			window.addEventListener('load', function() {
				WINDOW_LOADED = true;
				invalidate();
			}, false);
		} else if (window.attachEvent) {
			return window.attachEvent('onload', function() {
				WINDOW_LOADED = true;
				invalidate();
			});
		} else
			throw new Error(
					'ERROR : sorry but I can\'t prepare the user interface...\n try to add elements after enviroment is completely loaded');
	}

	function postInvalidate(reference) {
		var counter = 0;
		var max = 50;
		var interval = setInterval(function() {
			if (counter > max) {
				clearInterval(interval);
				throw new Error(
						'jRow ANR Exception : Aplication Not Responding !')
			}
			if (WINDOW_LOADED) {
				console.log('post invalidate...');
				clearInterval(interval);
				invalidate(reference);
				console.log('Done !');
			} else {
				counter++;
			}
		}, 100);
	}

	function reDraw(table) {
		context.jRow.UI.tables[table.title].draw();
	}

	function isLinked(table) {
		return (context.jRow.UI.tables[table.title] != undefined);
	}

	function invalidate(reference) {
		// console.log('It\'s time to create UI !');

		if (reference != undefined && !isLinked(reference)) {
			console.log(reference);
			throw new Error('jRow Excecption : Table ' + reference.title
					+ ' is not linked !');
		}

		if (reference instanceof context.jRow.Table) {
			context.jRow.UI.tables[reference.title].draw();
			context.jRow.UI.tables[reference.title].configure();
			return;
		}

		for ( var id in context.jRow.UI.links) {
			var div = document.getElementById(id);
			var table = context.jRow.UI.links[id];
			context.jRow.UI.tables[table.title] = new UiTable(div, table);
			context.jRow.UI.tables[table.title].draw();
			context.jRow.UI.tables[table.title].configure();
		}
	}

	function link(divId, table, settings) {
		if (table instanceof Table) {
			// console.log('the table', table.title, 'is instance of Table');
			context.jRow.UI.links[divId] = table;
			if (settings != null && typeof settings == 'object') {
				context.jRow.UI.layouts[divId] = settings;
			}
		}
	}

	function configure() {
		var id = this.div.getAttribute('id');
		var settings = context.jRow.UI.layouts[id];
		var tableElement = document.getElementById(id + '_table');

		if (!settings)
			return;

		for ( var i = 0; i < this.table.cols; i++) {
			if ('col' + i in settings) {
				var id = this.table.title + '_col_' + i;
				var col = document.getElementById(id);
				// console.log(col);
				col.style.width = settings['col' + i];
			}

		}

		for ( var option in settings) {
			switch (option) {
			case 'width':
				this.div.style.width = settings[option];
				break;
			case 'height':
				var id = this.div.getAttribute('id');
				var tableElement = document.getElementById(id+'_table');
				tableElement.style.height = settings[option] ;
				// this.div.style.height = settings[option];
				break;
			case 'onRowClick':
				if (typeof settings[option] == 'function') {
					this.onRowClick = settings[option];
				}
				break;
			case 'enableContextMenu':
				this.enableContextMenu = settings[option];
				break;
			case 'onPrepareContextMenu':
				if (typeof settings[option] == 'function') {
					this.onPrepareContextMenu = settings[option];
				}
				break;
			case 'onContextMenuItem':
				if (typeof settings[option] == 'function') {
					this.onContextMenuItem = settings[option];
				}
				break;
			case 'collapsed':
				if (!settings[option]) {
					var arrow = document.getElementById(this.div
							.getAttribute('id')
							+ '_arrow');
					arrow.onclick();
				}
				break;
			case 'alternateHeader':
				if (isArray(settings[option])) {
					this.alternateHeader = settings[option];
					reDraw(this.table);
				}
				break;
			}
		}
	}

	function getStyle(el, rule) {
		var value = "";
		if (document.defaultView && document.defaultView.getComputedStyle) {
			value = document.defaultView.getComputedStyle(el, "")
					.getPropertyValue(rule);
		} else if (el.currentStyle) {
			rule = rule.replace(/\-(\w)/g, function(match, p1) {
				return p1.toUpperCase();
			});
			value = el.currentStyle[rule];
		}
		return value;
	}

	function contextMenu(x, y, row) {
		// console.log(x,y);
		var id = this.div.getAttribute('id');
		var container = document.getElementById(id);
		var menu = document.getElementById(id + '_context_menu');
		var line = document.getElementById(id + '_table_row_' + row._id);

		line.style.border = '2px dashed #78aece';

		createContextMenuList(this, menu, row, this.onPrepareContextMenu());

		x = x + (document.body.scrollLeft || document.documentElement.scrollLeft);
		y = y + (document.body.scrollTop || document.documentElement.scrollTop);

		menu.style.left = x ? x + 'px' : menu.style.left;
		menu.style.top = y ? y + 'px' : menu.style.top;
		menu.style.display = 'block';
	}

	function createContextMenuList(context, node, row, list) {
		// clenup !
		while (node.firstChild) {
			node.removeChild(node.firstChild);
		}

		for ( var i in list) {
			var li = document.createElement('li');
			var content = document.createTextNode(list[i]);
			li.appendChild(content);
			li.setAttribute('idItem', i);
			li.onclick = function() {
				var idItem = this.getAttribute('idItem');
				if (context.onContextMenuItem) {
					context.onContextMenuItem(idItem, row);
				}
				node.style.display = 'none';
			}
			node.appendChild(li);
		}

		node.onmouseover = function() {
			// console.log('context menu mouse over');
			clearTimeout(this.contextMenuTimeout);
		}

		node.onmouseout = function() {
			// console.log('context menu mouse out');
			this.contextMenuTimeout = setTimeout(function() {
				node.style.display = 'none';
				var id = context.div.getAttribute('id');
				var line = document
						.getElementById(id + '_table_row_' + row._id);
				line.style.border = '';
			}, 200);
		}
	}

	function UiTable(div, table) {
		this.div = div;
		this.table = table;
	}

	UiTable.prototype = {
		constructor : UiTable,
		configure : configure,
		showContextMenu : contextMenu,
		onPrepareContextMenu : function() {
		},
		onContextMenuItem : function() {
		}
	}

	UiTable.prototype.draw = function() {
		// console.log('Drawing table :', this.table.title);
		var br = '<br>\n';
		var nl = '\n';
		var html = '<div class="ui_table_title"> <img id="'
				+ this.div.getAttribute('id') + '_arrow" src="'+ context.jRow.root +'/images/'
				+ context.jRow.UI.ARROW_COLLAPSE
				+ '" style="vertical-align:middle;" > ' + this.table.title
				+ '<img src="'+ context.jRow.root +'/images/jrow_title_ad.png" align="right"></div>'
				+ nl + '<table id="' + this.div.getAttribute('id')
				+ '_table" class="ui_table" collapsed="true">' + nl
				+ '	{colgroup}' + nl + '	<thead>' + nl + '		{thead_content}'
				+ nl + '	</thead>' + nl + '	<tbody>' + nl + '		{tbody_content}'
				+ nl + '	</tbody>' + nl + '	<tfoot>' + nl
				+ '		<tr><td colspan="' + this.table.cols
				+ '">{tfoot_content}</td></tr>' + nl + '	</tfoot>' + nl
				+ ' <div class="ui_context_menu">' + nl + ' <ul id="'
				+ this.div.getAttribute('id') + '_context_menu"class="menu">'
				+ '</ul></div>';

		var colgroup = '';
		var thead = '<tr>';
		var tbody = '';
		var tfoot = 'powered by jRow.js (c) 2013 ver. ' + context.jRow.version;

		// COLGROUP
		for ( var i = 0; i < this.table.cols; i++) {
			var col = '<col id="' + this.table.title + '_col_' + i + '">';
			colgroup += col + nl;
		}
		// THEAD
		var tableHeader = (isArray(this.alternateHeader) && this.alternateHeader.length == this.table.header.length) ? this.alternateHeader
				: this.table.header;
		for ( var i in tableHeader) {
			thead += '<th>' + tableHeader[i] + '</th>';
		}
		thead += '</tr>';

		// TBODY
		for ( var n in this.table.collections) {
			var row = this.table.collections[n];
			var counter = 0;
			// console.log('UI',row);
			tbody += '<tr id="' + this.div.getAttribute('id') + '_table_row_'
					+ n + '">';
			for ( var value in row) {
				if (value != '_id') {
					counter++;
					tbody += '<td>' + row[value] + '</td>';
				}
			}
			var span = this.table.cols - counter;
			// console.log('span ?',this.table.cols,span);
			for ( var i = 0; i < span; i++) {
				tbody += '<td></td>';
			}
			tbody += '</tr>';
		}

		html = html.replace('{colgroup}', colgroup);
		html = html.replace('{thead_content}', thead);
		html = html.replace('{tbody_content}', tbody);
		html = html.replace('{tfoot_content}', tfoot);

		this.div.innerHTML = html;

		var id = this.div.getAttribute('id');
		var _this = this;

		for ( var n in this.table.collections) {
			var r = document.getElementById(id + '_table_row_' + n);
			r.setAttribute('idRow', n);
			r.oncontextmenu = function(e) {
				// console.log(e.pageX,e.pageY);
				_this.clickCoordX = e.clientX || e.x;
				_this.clickCoordY = e.clientY || e.y;
				var id = this.getAttribute('idRow');
				var result = _this.table.getResult({
					_id : id
				});
				if (_this.enableContextMenu)
					_this.showContextMenu(_this.clickCoordX, _this.clickCoordY,
							result[0]);
				return false;
			};
			r.onclick = function(e) {
				_this.clickCoordX = e.clientX || e.x;
				_this.clickCoordY = e.clientY || e.y;
				var id = this.getAttribute('idRow');
				var result = _this.table.getResult({
					_id : id
				});
				if (_this.onRowClick)
					_this.onRowClick(result[0]);
			}
		}

		var arrow = document.getElementById(id + '_arrow');
		var table = document.getElementById(id + '_table');
		var contextMenu = document.getElementById(id + '_context_menu');

		arrow.onclick = function() {
			var collapsed = table.getAttribute('collapsed');
			if (collapsed) {
				this.src = context.jRow.root + '/images/' + context.jRow.UI.ARROW_EXPAND;
				table.style.display = 'none';
				contextMenu.style.display = 'none';
				table.setAttribute('collapsed', '');

			} else {
				this.src = ontext.jRow.root + '/images/' + context.jRow.UI.ARROW_COLLAPSE;
				table.style.display = 'table';
				table.setAttribute('collapsed', 'true');
			}
		}
	}

})(JROW_CONTEXT);