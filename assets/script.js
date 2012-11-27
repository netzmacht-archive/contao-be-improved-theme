/**
 * BackendRowConnector adds javascript events to rows
 * and allows to find nested elements by adding conditions
 *
 * @author David Molineus <http://www.netzmacht.de>
 */
function BackendRowWidget(row, sub)
{
	var self = this;
	var row = $$(row);
	var sub = sub;
	var element;
	var conditions = new Array();

	self.init = function(type)
	{		
		// element not found
		if(row.length == 0) {
			return;
		}

		if(type == 'toggle') {
			//$$(sub).addClass('behidden');
			row.addEvent('click', function(e) {
				toggleChildren(this, e);
			});

			// only toggle if no search request was made
			var search = $$('.tl_panel input.active').length;

			// hide child rows if more than 3 parents are found
			if(search === 0 && row.length > 3) {
				toggleChildren(row);
			}
		}
		else {
			row.addEvent('click', findChildUrl);

			// create tips for the rows
			for(i= 0; i < row.length; i++) {
				addTips(row[i], type);
			}
		}
	}


	self.createCondition = function(type, property, value, result)
	{
		// create single condition
		var condition = new Object();

		condition.type = type;
		condition.property = property;
		condition.value = value;
		condition.result = result;

		return condition;		
	}


	self.addCondition = function(condition, type, value, result)
	{
		// create condition
		if(typeof condition === 'string') {
			conditions.push(self.createCondition(condition, type, value, result));
			return;			
		}

		// create combined condition object
		var obj = new Object();
		obj.conditions = condition;
		obj.type = type;

		conditions.push(obj);
	}


	var addTips = function(el)
	{
		if(typeof Tips.BackendRow == 'undefined') {
			return;
		}
		
		var elements = el.getElements(sub);

		for(var i=0; i< elements.length; i++) {
			element = elements[i];

			go = 0;

			for (var j = 0; j < conditions.length; j++) {								
				if (handleCondition(conditions[j])) {
					go++;
					break;
				}								
			}

			if(go==0) {
				el.set('title', element.retrieve('tip:title', element.get('title')));
				new Tips.BackendRow(el, { 
					offset: {
						x: element.getPosition(el).x, 
						y: element.getPosition(el).y + 25
					},
					fixed: false,
					parentClass: el.getProperty('class')
				});
				
				return;
			}
		}
	}


	var findChildUrl = function()
	{
		var elements = this.getElements(sub);

		for(var i=0; i< elements.length; i++) {
			element = elements[i];

			go = 0;

			for (var j = 0; j < conditions.length; j++) {								
				if (handleCondition(conditions[j])) {
					go++;
					break;
				}								
			}

			if(go==0) {
				window.location.href = element.getProperty('href');
				return;
			}
		}				
	}


	var handleCondition = function(condition)
	{
		// condition is not an set of conditions so directly handle it
		if(typeof condition === 'object') {
			switch (condition.type) {
				case 'value':
					var value = (element.getProperty(condition.property) == condition.value);
					return (value == condition.result);
					break;

				case 'test':
					var value = new String(element.getProperty(condition.property));					
					return (value.test(condition.value, 'i') == condition.result);
					break;
			}
			return false;
		}


		// handle set of conditions
		var results = false;

		if(condition.type == 'and') {
			results = true;
		}

		for(var i=0; i < condition.conditions.length; i++) {
			var result = handleCondition(condition.conditions[i]);

			// handle and conditions
			if(condition.type == 'and') {
				results = results && result;
			}

			// handle or condition
			else {
				results = result || result;
			}
		}

		return results;
	}

	var toggleChildren = function(el, e)
	{
		if(e) {
			e.stopPropagation();
		}

		if(el != null) {
			if(el.length > 1) {
				el.each(function(child) {
					toggleChildren(child);				
				});
			}

			var elements = el.getAllNext();
		}
		else {
			var elements = this.getAllNext();
		}

		for(var i=0; i< elements.length; i++) {
			element = elements[i];

			for (var j = 0; j < conditions.length; j++) {								
				if (handleCondition(conditions[j])) {
					return;
					break;
				}								
			}

			element.toggleClass('behidden');
		}
	}
}


/**
 * create modified tip class which only shows tip if not a children 
 * fired the tip. Need this to handles icon tips inside the row
 * 
 * it's a contao 3 feature, so let's check if Tips.Contao exists
*/

if(typeof Tips.Contao != 'undefined')
{
	Tips.BackendRow = new Class(
	{
		Extends: Tips.Contao,
	
		elementEnter: function(event, element) {
			var tag = event.target.get('tag');
	
			if(tag != 'a' && tag != 'img') {
				this.options.fixed = true;
				this.parent(event, element);
			}
			else {
				this.fireEvent('mouseleave', event);
			}
		},
	
		elementMove: function(event, element) {
			var tag = event.target.get('tag');
			if(tag == 'a' || tag == 'img') {
				clearTimeout(this.timer);
				this.hide(element);
			}
		}
	});	
}

document.addEvent('domready', function() 
{

	// prevent toggling icon trigger other functions	
	$$('.tl_listing li .tl_left > a, .tl_listing tr .tl_left > a, .tl_right_nowrap > a, .tl_right > a').addEvent('click', function(e) {
		e.stopPropagation();
	});

	// init listing 
	var listing = new BackendRowWidget('.tl_listing li.tl_file, .tl_listing tr', '.tl_right a, .tl_right_nowrap a');

	// define common condition set which will be used for tl_content and tl_header as well
	conditions = new Array();
	conditions.push(listing.createCondition('test', 'href', 'act', true));
	conditions.push(listing.createCondition('test', 'href', 'act=edit&', false));

	listing.addCondition('test', 'href', 'act=delete&', true); // prevent delete link is called
	listing.addCondition(conditions, 'or');
	listing.init();


	// init file manager folder toggling 
	var folder = new BackendRowWidget('.tl_listing li.tl_folder', 'a');
	folder.addCondition('value', 'onclick', null, true);
	folder.addCondition('test', 'href', 'do=files', false);
	folder.init();


	// init article view page toggling
	var page = new BackendRowWidget('.tl_listing.tl_tree_xtnd li.tl_folder', '.tl_file, .parent');
	page.addCondition('test', 'class', 'tl_folder', true);
	page.addCondition('test', 'class', 'parent', true);
	page.init('toggle');


	// init tl_content
	var content = new BackendRowWidget('.tl_content', '.tl_content_right a');
	content.addCondition(conditions, 'or');
	content.init();

	
	// init tl_header
	var header = new BackendRowWidget('.tl_header', '.tl_content_right a');
	header.addCondition('test', 'href', 'act=delete&', true); // prevent delete link is called
	header.addCondition(conditions, 'or');
	header.init();


	// init content header handling 
	var contentHeader = new BackendRowWidget('.tl_listing_container.parent_view .tl_content_header', '.tl_content');
	contentHeader.addCondition('test', 'class', 'tl_content_header', true);
	contentHeader.init('toggle');

});
