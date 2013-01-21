/**
 * BackendRowConnector adds javascript events to rows
 * and allows to find nested elements by adding conditions
 *
 * @author David Molineus <http://www.netzmacht.de>
 */
function BackendArticleTreeToggler(row)
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

			element.toggleClass('beit_hidden');
		}
	}
}


document.addEvent('domready', function() 
{
	// init article view page toggling
	var page = new BackendArticleTreeToggler('.tl_listing.tl_tree_xtnd li.tl_folder');
	page.addBreakClass('tl_folder');
	page.addBreakClass('parent');
	page.init();

});
