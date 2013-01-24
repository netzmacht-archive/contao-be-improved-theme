/**
 * BackendImprovedFileTree toggles rows in the file tree
 * 
 * @author David Molineus <http://www.netzmacht.de>
 * @package be_improved_theme
 */
var BackendImprovedFileTree = new Class({
	
	Extends: BackendImprovedTree,
	
	/**
	 * initialization set options
	 */
	initialize: function(options)
	{
		if(options.targets == undefined)
		{
			options.targets = '.tl_listing, .tl_listing .parent > ul';
		}
		
		this.parent(options);
	},
	
	
	/**
	 * start toggler
	 */
	startToggler: function()
	{
		// assign every row		
		this.targets.each(function(target) 
		{
			this.toggleChildren(target, false, true);			
			
			target.getChildren('.tl_folder_top, .tl_folder').each(function(element) 
			{
				if(element.hasClass('tl_folder_top'))
				{
					var next = element.getNext();
					
					// FileSelector renders file tree different than normal file tree
					if(next.hasClass('parent'))
					{
						element.addEvent('click', function(e) {
							this.toggleChildren(next.getElement('ul'), e);
						}.bind(this));						
					}
					else {
						element.addEvent('click', function(e) {
							this.toggleChildren(target, e);
						}.bind(this));
					}
				}
				else
				{
					var next = element.getNext();
					var link = element.getElement('.tl_left > a');
										
					element.addEvent('click', function(e) {
						if(link.getElement('img').getProperty('src').search('folPlus.gif') > 0)
						{
							// triggering onclick action does not work, lets fetch code by regex
							var regex = new RegExp(/AjaxRequest\.toggleFileManager\(([^\'^,]*),\s*\'?([^\'^,]*)\'?,\s*\'?([^\'^,]*)\'?,\s*([^\'^,]*)\)/);
							var result = regex.exec(link.getProperty('onclick'));
							
							Backend.getScrollOffset();
							return AjaxRequest.toggleFileManager(link, result[2], result[3], result[4]);
						}
						else if(next != undefined && next.hasClass('parent')) {
							this.toggleChildren(next.getElement('ul'), e);	
						}							
					}.bind(this));
				}
			}.bind(this));
		}.bind(this));
		
		// assign new targets
		window.addEvent('ajax_change', function(e) {
			newTargets = $$(this.options.targets);
			
			newTargets.each(function(target) {
				// not a new target
				if(this.targets.contains(target)) 
				{
					return;
				}
				
				this.toggleChildren(target, false, true);
				
				// get parent
				var parent = target.getParent();
				
				if(parent == undefined || !parent.hasClass('parent'))
				{
					return;							
				}
				
				// get previous which toggles target
				var prev = parent.getPrevious();
				if(prev != undefined) 
				{
					prev.addEvent('click', function(e) {
						this.toggleChildren(target, e);
					}.bind(this));
				}
				
				target.getElements('.tl_folder').each(function(folder) {
					var link = folder.getElement('.tl_left > a');
										
					folder.addEvent('click', function(e) {
						if(link.getElement('img').getProperty('src').search('folPlus.gif') > 0)
						{
							// triggering onclick action does not work, lets fetch code by regex
							var regex = new RegExp(/AjaxRequest\.toggleFileManager\(([^\'^,]*),\s*\'?([^\'^,]*)\'?,\s*\'?([^\'^,]*)\'?,\s*([^\'^,]*)\)/);
							var result = regex.exec(link.getProperty('onclick'));
							
							Backend.getScrollOffset();
							return AjaxRequest.toggleFileManager(link, result[2], result[3], result[4]);
						}						
					}.bind(this));
				});
				
				
			}.bind(this));
			
			// update targets
			this.targets = newTargets;
		}.bind(this));
		
	},
	
	
	/**
	 * get children of element
	 * @param Element
	 * @return Array
	 */
	getChildren: function(element)
	{
		return element.getChildren('.tl_file');
	},
	
	
	/**
	 * 
	 */
	getNodeId: function(target)
	{
		if(target.hasClass('tl_listing'))
		{
			target = target.getFirst();
		}
		else
		{
			target = target.getParent().getPrevious();			
		}
				
		if(target.hasClass('tl_folder_top'))
		{
			return 'tl_folder_top';
		}
		else if(target != undefined)
		{
			return this.parent(target);			
		}
		
		return 0;		
	}
});
