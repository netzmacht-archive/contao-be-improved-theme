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
				var next = element.getNext();
				
				if(element.hasClass('tl_folder_top'))
				{
					// FileSelector renders file tree different than normal file tree
					if(next.hasClass('parent'))
					{
						element.addEvent('click', function(e) {
							this.toggleChildren(next.getElement('ul'), e);							
						}.bind(this));
						
						this.createRowToggleIcon(next.getElement('ul'), element);
					}
					else {
						element.addEvent('click', function(e) {							
							this.toggleChildren(target, e);
							
						}.bind(this));
						
						this.createRowToggleIcon(target, element);
					}
				}
				else
				{	
					var link = element.getElement('.tl_left > a');
					
					this.handleAjaxToggleIcon(element, function(e) {
						this.createRowToggleIcon(next.getElement('ul'), element);
						this.toggleChildren(next.getElement('ul'), e);
					}.bind(this));
					
					this.createRowToggleIcon(next.getElement('ul'), element);
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
						this.createRowToggleIcon(target, prev);
						this.toggleChildren(target, e);
					}.bind(this));
				}
				
				this.createRowToggleIcon(target, prev);
				
				target.getElements('.tl_folder').each(function(folder) {
					this.handleAjaxToggleIcon(folder);
				}.bind(this));
			}.bind(this));
			
			// update targets
			this.targets = newTargets;
		}.bind(this));
		
	},
	
	
	/**
	 * walk trough each target
	 */
	eachTarget: function(func)
	{
		this.targets.each(function(target) {
			func(target);				
		});
	},
	
	
	/**
	 * handle Contao's Ajax Toggle of a row
	 * @param Elemnet
	 */
	handleAjaxToggleIcon: function(folder, func)
	{
		var link = folder.getElement('.tl_left > a');
		
		if(link == undefined || link.getElement('img') == undefined) {
			return false;
		}
		
		var tg = link.getElement('img').getProperty('src');
		
		if(tg != undefined && tg.search('fol') > 0)
		{
			link.addEvent('click', function(e) {
				e.stopPropagation();		
			});
		}
		
		// triggering onclick action does not work, lets fetch code by regex
		folder.addEvent('click', function(e) {
			if(tg != undefined && tg.search('folPlus.gif') > 0) {
				var regex = new RegExp(/AjaxRequest\.toggleFileManager\(([^\'^,]*),\s*\'?([^\'^,]*)\'?,\s*\'?([^\'^,]*)\'?,\s*([^\'^,]*)\)/);
				var result = regex.exec(link.getProperty('onclick'));
				
				Backend.getScrollOffset();
				return AjaxRequest.toggleFileManager(link, result[2], result[3], result[4]);
			}
			else if(func != undefined)
			{
				func(e);
			}
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
	 * get node id of target
	 * 
	 * @param Element
	 * @return string|int
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
	},
	
	
	/**
	 * we need an extra level for search handling in the file tree
	 * @param target
	 * @param string 
	 */
	searchChildren: function(target, value)
	{
		var found = false;
		target.getChildren().each(function(child) {
			
			if(!child.hasClass('tl_folder_top') && this.parent(child, value)) {
				found = true;
			}	
		}.bind(this));
		
		// top element, do not handle parent
		if(target.hasClass('tl_listing'))
		{
			return;
		}
		
		var toggler = target.getParent().getPrevious();
		var local = toggler.get('text').test(value, 'i');
		
		this.setSearchState(toggler, found || local);
		
		if(local)
		{
			this.getChildren(target).each(function(child) {
				this.setSearchState(toggler, true);
			}.bind(this));				
		}
	},
	
});
