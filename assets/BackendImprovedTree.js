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
		toggleIcon: ['', ''],
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
			
			var a = new Element('a');
			var top = $$('.tl_folder_top .tl_right')[0];
			var img = new Element('img').setProperty('src', 'system/themes/' + Contao.theme + '/images/folPlus.gif');

			a.set('text', this.options.toggleIcon[0]);
			a.set('title', this.options.toggleIcon[1]);
			img.inject(a);
			
			if(top.getChildren().length > 0)
			{
				var space = document.createTextNode(' ');
				top.appendText(' ', 'top');
				a.inject(top, 'top');
			}
			else{
				a.inject(top);
			}

			a.addEvent('click', function(e) {
				e.stopPropagation();
				this.toggleIcon();				
			}.bind(this));
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
	toggleChildren: function(el, e, storage, value)
	{
		if(e) {
			e.stopPropagation();
		}

		if(el.length > 1) {
			el.each(function(child) {
				this.toggleChildren(child, e, storage, value);				
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
			if(value != undefined)
			{
				if(value) {
					element.addClass('beit_hidden');
				}
				else {
					element.removeClass('beit_hidden');
				}
			}
			else
			{
				element.toggleClass('beit_hidden');				
			}			
			state = element.hasClass('beit_hidden');
		});

		if(this.options.enableStorage && state != undefined)
		{
			var node = this.getNodeId(el);

			if(node != 0)
			{
				$.jStorage.set(this.options.storageKey + node, state);
			}
		}
	},
	
	
	/**
	 * Toggle Icon handler
	 * @param Event
	 */
	toggleIcon: function()
	{		
		this.toggleChildren(this.targets, false, false, $$('.beit_hidden').length == 0);
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
			node = new String(href).match('node=([^&]*)');
			
			if(node != undefined)
			{
				node = node[1];
				break;
			}
		}
		
		return node;
	},
	
});
