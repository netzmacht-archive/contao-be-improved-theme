/**
 * BackendRowConnector adds javascript events to rows
 * and allows to find nested elements by adding conditions
 *
 * @author David Molineus <http://www.netzmacht.de>
 */
function BackendFileTreeToggler(row)
{
	var self = this;
	var rowClass = row;
	var rows = $$(rowClass);
	var element;

	self.init = function()
	{			
		// element not found
		if(rows.length == 0) {
			return;
		}
		
		// assign every row		
		rows.each(function(row) {	
			// hide child rows if more than 3 parents are found
			toggleChildren(row);			
			
			row.getChildren().each(function(element) {
				if(element.hasClass('tl_folder_top'))
				{
					var next = element.getNext();
					
					// FileSelector renders file tree different than normal file tree
					if(next.hasClass('parent'))
					{
						element.addEvent('click', function(e) {
							toggleChildren(next.getElement('ul'), e);
						});						
					}
					else {
						element.addEvent('click', function(e) {
							toggleChildren(row, e);
						});
					}
					
				}
				else
				{
					var next = element.getNext();
					
					if(next != undefined && next.hasClass('parent')) {
						element.addEvent('click', function(e) {
							toggleChildren(next.getElement('ul'), e);
						});
					}
				}
			});
		});
		
		// assign new rows
		window.addEvent('ajax_change', function(e) {
			newRows = $$(rowClass);
			
			newRows.each(function(row) {
				// not a new row
				if(rows.contains(row)) 
				{
					return;
				}
				
				toggleChildren(row);
				
				// get parent
				var parent = row.getParent();
				
				if(parent == undefined || !parent.hasClass('parent'))
				{
					return;							
				}
				
				// get previous which toggles row
				var prev = parent.getPrevious();		
				if(prev != undefined) 
				{
					prev.addEvent('click', function(e) {
						toggleChildren(row, e);
					});
				}
			});
			
			// update rows
			rows = newRows;
		});
	}


	var toggleChildren = function(el, e)
	{
		if(e) {
			e.stopPropagation();
		}
		
		if(el != undefined) 
		{
			if(el.length > 1) {
				el.each(function(child) {
					toggleChildren(child);				
				});
			}

			var elements = el.getChildren();
		}
		else {
			var elements = this.getChildren();
		}

		elements.each(function(element) {		
			if(element.hasClass('tl_file'))
			{
				element.toggleClass('beit_hidden');				
			}
		});
	}
}


document.addEvent('domready', function() 
{
	var fileTreeToggler = new BackendFileTreeToggler('.tl_listing, .tl_listing .parent > ul');
	fileTreeToggler.init();
});
