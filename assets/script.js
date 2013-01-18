/**
 * BackendRowTarget connects row to an operation
 * @author David Molineus <http://netzmacht.de>
 */
function BackendRowTarget()
{
	var self = this;
	
	/**
	 * prevent that operation themselve propagate the event to the row
	 * 
	 * @param string target
	 */
	self.stopPropagation = function(target)
	{
		$$(target).addEvent('click', function(e) 
		{
			e.stopPropagation();
		});
	}
	
	
	/**
	 * connect a row to the target
	 * 
	 * @param string target
	 */
	self.connect = function(target)
	{
		var row = $$(target);
		
		// connect row to target
		row.addEvent('click', function(e)
		{
			var link = this.getElement('.beit_target, .beit_fallback');
		
			if(link)
			{
				window.location.href = link.getProperty('href');
			}
		});
		
		// add tips to the row
		for(i= 0; i < row.length; i++) 
		{
			addTips(row[i]);
		}
	}
	
	/**
	 * handle contao mootools tips which are created in Contao 3
	 */
	var addTips = function(el)
	{
		if(typeof Tips.BackendRow == 'undefined') {
			return;
		}
		
		var link = el.getElement('.beit_target, .beit_fallback');

		if(link)
		{
			el.set('title', link.retrieve('tip:title', link.get('title')));
			new Tips.BackendRow(el, { 
				offset: {
					x: link.getPosition(el).x, 
					y: link.getPosition(el).y + 25
				},
				fixed: false,
				parentClass: el.getProperty('class')
			});
		}
	}
}


/**
 * BackendRowConnector adds javascript events to rows
 * and allows to find nested elements by adding conditions
 *
 * @author David Molineus <http://www.netzmacht.de>
 */
function BackendRowToggler(row)
{
	var self = this;
	var rowClass = row;
	var row = $$(rowClass);
	var element;
	var breakClasses = new Array();

	self.init = function()
	{		
		// element not found
		if(row.length == 0) {
			return;
		}

		row.addEvent('click', function(e) {
			toggleChildren(this, e);
		});

		// only toggle if no search request was made
		var search = $$('.tl_panel input.active').length;

		// hide child rows if more than 3 parents are found
		if(search === 0 && row.length > 3) {
			toggleChildren(row);
		}
		
		window.addEvent('ajax_change', function(e) {
			// reassign row to fetch new elements
			newRow = $$(rowClass);				
			newRow.each(function(el) {
				if(!row.contains(el)) {
					toggleChildren(el);
				}
			});
			
			newRow.addEvent('click', function(e) {
				toggleChildren(this, e);
			});
		});
	}


	self.addBreakClass = function(value)
	{
		breakClasses.push(value);
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

			for (var j = 0; j < breakClasses.length; j++) {								
				if (element.hasClass(breakClasses[j])) {
					return;
					break;
				}								
			}

			element.toggleClass('behidden');
		}
	}
}


/**
 * create modified tip class which only show tip if not a children 
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
	// initialize Backend Row target connection
	var target = new BackendRowTarget();
	target.stopPropagation('.tl_listing .tl_left > a');
	target.stopPropagation('.tl_right_nowrap > a');
	target.stopPropagation('.tl_right > a');
	target.stopPropagation('.tl_content_right > a');
	
	// add row elements
	// have to split between tl_folder and tl_file otherwise tips get crazy
	target.connect('.tl_listing li.tl_folder');
	target.connect('.tl_listing li.tl_file');
	target.connect('.tl_listing tr');
	target.connect('.tl_content');
	target.connect('.tl_header');

	// init article view page toggling
	var page = new BackendRowToggler('.tl_listing.tl_tree_xtnd li.tl_folder');
	page.addBreakClass('tl_folder');
	page.addBreakClass('parent');
	page.init();

});
