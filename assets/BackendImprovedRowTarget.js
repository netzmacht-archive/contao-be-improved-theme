/**
 * BackendRowTarget connects row to an operation
 * @author David Molineus <http://netzmacht.de>
 */
function BackendImprovedRowTarget()
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
	self.connect = function(target, disableTips)
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
		if(disableTips == undefined || !disableTips)
		{
			for(i= 0; i < row.length; i++) 
			{
				addTips(row[i]);
			}			
		}
		
		// kee track of ajax changes
		window.addEvent('ajax_change', function(e) {
			var newRows = $$(target);
			
			newRows.each(function(element) 
			{
				if(!row.contains(element))
				{
					element.addEvent('click', function(e)
					{
						var link = this.getElement('.beit_target, .beit_fallback');
					
						if(link)
						{
							window.location.href = link.getProperty('href');
						}
					});
					
					addTips(element);
				}
			}.bind(this));
			
			row = newRows;
		}.bind(this));
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