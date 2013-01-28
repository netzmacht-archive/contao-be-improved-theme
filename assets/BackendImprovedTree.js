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
		enableToggling: true,
		enableSearch: true,
		storageKey: 'beit:hidden',
		storageSearchKey: 'beit:search',
		storagePrefix: '',
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
		this.options.storageKey = this.options.storagePrefix + this.options.storageKey + ':' + this.options.table + ':';
		this.options.storageSearchKey = this.options.storagePrefix + this.options.storageSearchKey + ':' + this.options.table;
		
		if(this.targets.length == 0)
		{
			return;
		}
		
		if(this.options.enableToggling)
		{
			this.initializeToggling();
		}
		
		if(this.options.enableSearch)
		{
			this.initializeSearch();
		}
	},
	
	
	/**
	 * initialize search filter 
	 */
	initializeSearch: function()
	{
		var input = new BackendImprovedSearchWidget({ visible: false });
		var root = document.getElement('.tl_folder_top .tl_right');
		
		var a = new Element('a');
		var img = new Element('img').setProperty('src', 'system/modules/be_improved_theme/assets/search.png');
		
		img.inject(a);
		root.appendText(' ', 'top');
		a.inject(root, 'top');
		
		a.addEvent('click', function(e) {
			e.stopPropagation();
			root.hide();
			input.show();
		});
		
		input.addEvent('show', function(e) {
			input.search(e);
			root.hide();
		});
		
		input.addEvent('hide', function(e) {
			root.show();
		});
		
		input.addEvent('click', function(e) {
			input.hide();
			e.stopPropagation();
		});
		
		input.addEvent('change', function(e, search) {
			var value = input.get('value');
			
			if(search)
			{
				this.eachTarget(function(target) {
					this.searchChildren(target, value);	
				}.bind(this), true);
			}
			else {
				$$('.beit_search_result').each(function(el) {
					el.removeClass('beit_search_result');
				});
				
				$$('.beit_search_hidden').each(function(el) {
					el.removeClass('beit_search_hidden');
				});
				
				value = '';
			}
			
			if(this.options.enableStorage) {
				$.jStorage.set(this.options.storageSearchKey, value);	
			}
		}.bind(this));
		
		input.addEvent('hide', function(e) {
			$$('.beit_search_result').each(function(el) {
				el.removeClass('beit_search_result');
			});
			
			$$('.beit_search_hidden').each(function(el) {
				el.removeClass('beit_search_hidden');
			});
			
			$.jStorage.set(this.options.storageSearchKey, '');
		}.bind(this));
		

		// initialize search if storage is set
		if(this.options.enableStorage && $.jStorage.get(this.options.storageSearchKey) != '' && $.jStorage.get(this.options.storageSearchKey) != undefined) {
			
			input.set('value', $.jStorage.get(this.options.storageSearchKey));
			input.search();
			input.show();
		}
	},
	
	/**
	 * initialize toggling
	 */
	initializeToggling: function()
	{
		this.startToggler();
		
		var a = new Element('a');
		var top = $$('.tl_folder_top .tl_right')[0];
		var img = new Element('img').setProperty('src', 'system/modules/be_improved_theme/assets/toggle.png');

		a.set('text', this.options.toggleIcon[0] + ' ');
		
		if(this.options.toggleIcon[1] != undefined) {
			a.set('title', this.options.toggleIcon[1]);	
		}
		
		img.inject(a);
		
		if(top.getChildren().length > 0)
		{
			a.inject(top, 'top');
		}
		else{
			a.inject(top);
		}

		a.addEvent('click', function(e) {
			e.stopPropagation();
			var hide = $$('.beit_hidden').length == 0;
		
			this.eachTarget(function(target) {
				this.toggleChildren(target, false, false, hide);
			}.bind(this));	
		}.bind(this));
	},
	
	
	/**
	 * walk trough each target, neccessary for suporting FileTree
	 * @param function for every target
	 * @param additional child option for
	 */
	eachTarget: function(func, children)
	{
		this.targets.each(function(target) {
			func(target);
		});
	},
	
	
	/**
	 * 
	 */
	searchChildren: function(element, value, stop)
	{
		var found = false;
		
		if(element.length > 1)
		{
			element.each(function(child) {
				if(this.searchChildren(child, value)) {
					found = true;
				}
			}.bind(this));
		}
		else
		{
			var text = element.get('text');
			
			if(stop == undefined && !stop) {
				this.getChildren(element).each(function(child) {
					if(this.searchChildren(child, value, true)) {
						found = true;
					}
				}.bind(this));
			}
			
			found = found || text.test(value, 'i');
			this.setSearchState(element, found);
			
			this.getChildren(element).each(function(child) {
				this.setSearchState(child, found);
			}.bind(this));			
		}
		
		return found;
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
		
		if(target.length != undefined)
		{
			target.each(function(child) {
				this.createRowToggleIcon(child);
			}.bind(this));
		}
		else
		{
			this.createRowToggleIcon(target);
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
	
	
	/**
	 * 
	 */
	createRowToggleIcon: function(target, element)
	{	
		if(element == undefined)
		{
			var right = target.getElement('.tl_right');
		}
		else {
			var right = element.getElement('.tl_right');
		}
		
		var a = right.getElement('.beit_toggle');
		var img;
		
		if(a == undefined) {
			a = new Element('a');
			img = new Element('img');
			
			img.inject(a);
			a.addClass('beit_toggle');
			a.inject(right);	
		}
		else {
			img = a.getElement('img');			
		}

		if(target != undefined && this.getChildren(target).length > 0)
		{
			img.setProperty('src', 'system/modules/be_improved_theme/assets/toggle.png');
			a.removeClass('beit_empty');			
		}
		else {
			img.setProperty('src', 'system/modules/be_improved_theme/assets/empty.png');
			a.addClass('beit_empty');
		}
	},
	
	
	/**
	 * set search state
	 * @param Element
	 * @param bool
	 */
	setSearchState: function(element, found)
	{
		if(found)
		{
			element.addClass('beit_search_result');
			element.removeClass('beit_search_hidden');
		}
		else
		{
			element.removeClass('beit_search_result');
			element.addClass('beit_search_hidden');
		}
	},
	
});
