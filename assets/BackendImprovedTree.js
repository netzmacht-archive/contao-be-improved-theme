/**
 * BackendImprovedTree toggles rows in trees like the article tree
 * 
 * @author David Molineus <http://www.netzmacht.de>
 * @package be_improved_theme
 */
var BackendImprovedTree = new Class(
{
	
	Implements:	[Options],
	
	options: {
		enableStorage: true,
		storageKey: 'beit',
		table: 'default',
		toggleOnStart: true,
		targets: [],
	},
	
	
	/**
	 * initialization
	 * @param Object
	 */
	initialize: function(options)
	{
		this.setOptions(options);
		this.targets = $$(this.options.targets);
		this.options.storageKey = this.options.storageKey + ':' + this.options.table + ':'; 
		
		if(this.targets.length > 0)
		{
			this.startToggler();
		}
	},
	
	
	/**
	 * start the toggler
	 */
	startToggler: function()
	{
		// handle ajax changes
		window.addEvent('ajax_change', function(e) 
		{			
			newTargets = $$(this.options.targets);
			
			newTargets.each(function(target) 
			{				
				if(!this.targets.contains(target)) 
				{
					this.initializeTarget(target, !this.options.toggleOnStart);
				}
			}.bind(this));		
			
			this.targets = newTargets;
		}.bind(this));
		
		// only toggle if no search request was made
		var search = $$('.tl_panel input.active');

		// hide child rows if more than 3 parents are found
		if(search != undefined && search.length > 0 && this.targets.length <= 3) 
		{
			this.options.toggleOnStart = false;
		}
		
		// initialize at the beginning
		this.initializeTarget(this.targets, !this.options.toggleOnStart);
	},
	
	
	/**
	 * initialize the target
	 * @param object
	 * @param bool
	 */
	initializeTarget: function(target, prevent)
	{
		if(!prevent)
		{
			this.toggleChildren(target, false, true);
		}		
		
		var self = this;	
		target.addEvent('click', function(e) 
		{
			self.toggleChildren(this, e);						
		});
	},
	
	
	/**
	 * toggle children
	 * @param object
	 * @param Event
	 * @param fetch from storage
	 */
	toggleChildren: function(el, e, storage)
	{
		if(e) {
			e.stopPropagation();
		}

		if(el.length > 1) {
			el.each(function(child) {
				this.toggleChildren(child, e, storage);				
			}.bind(this));
		}
		else if(storage && this.options.enableStorage)
		{
			var node = this.getNodeId(el);
			
			if(node != 0)
			{
				if(!$.jStorage.get(this.options.storageKey + node, true))
				{
					return;
				}
			}				
		}

		var elements = this.getChildren(el);
		var state;
		
		elements.each(function(element) 
		{
			element.toggleClass('beit_hidden');
			state = element.hasClass('beit_hidden');
		});
		
		if(!storage && this.options.enableStorage && state != undefined)
		{
			var node = this.getNodeId(el);

			if(node != 0)
			{
				$.jStorage.set(this.options.storageKey + node, state);
			}
		}
	},
	
	
	/**
	 * get node id for storage purposes
	 * 
	 * @param object
	 * @return int|string
	 */
	getNodeId: function(element)
	{
		var z = element.getElements('.tl_left > a');
		var node = 0;
		var href;
					
		for(var i=0; i < z.length; i++)
		{
			href = z[i].getProperty('href');
			node = href.match('node=([^&]*)');
			
			if(node != undefined)
			{
				node = node[1];
				break;
			}
		}
		
		return node;
	},
	
});
