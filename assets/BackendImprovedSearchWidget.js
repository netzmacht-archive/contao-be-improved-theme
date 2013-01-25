/**
 * 
 */
var BackendImprovedSearchWidget = new Class({
	
	Implements:	[Options,Events],
	
	options: {
		containerClass : 'beit_search_widget',
		inputClass: 'beit_search',
		resetClass: 'beit_reset',
		inject: '.tl_folder_top .tl_right',
		injectPosition: 'after',
		minLength: 3,
		accessKey: 'w',
		triggerEvent: 'keyup',
		stopPropagation: true,
	},
	
	initialize: function(options)
	{
		this.setOptions(options);
		
		// create container
		this.container = new Element('div');
		this.container.addClass(this.options.containerClass);
		this.container.inject(document.getElement(this.options.inject), this.options.injectPosition);
		
		// create input
		this.input = new Element('input');
		this.input.addClass(this.options.inputClass);
		this.input.setProperty('accesskey', this.options.accessKey);
		this.input.inject(this.container);
		
		// create clear button
		this.resetBtn = new Element('img');
		this.resetBtn.setProperty('src', 'system/themes/default/images/close.gif');
		this.resetBtn.addClass(this.options.resetClass);
		this.resetBtn.inject(this.container);
				
		// register events		
		this.input.addEvent(this.options.triggerEvent, function(e) {
			this.search(e);
		}.bind(this));
		
		// reset if escape key is pressed
		this.input.addEvent('keyup', function(e) {
			if(e.key == 'esc') {
				this.hide();
			}
		}.bind(this));
		
		// listen to access key
		window.addEvent('keydown', function(e) {			
			if(e.alt && e.key == this.options.accessKey)
			{
				this.show();					
			}
		}.bind(this));
		
		// hide on reset button click
		this.resetBtn.addEvent('click', function(e) {
			this.hide();
		}.bind(this));
		
		// stop propagation
		if(this.options.stopPropagation)
		{
			this.container.addEvent('click', function(e) {
				e.stopPropagation();
			});
		}
		
		if(!this.options.visible)
		{
			this.hide();
		}
	},
	
	show: function()
	{
		this.shown = true;
		this.container.show();
		this.fireEvent('show');
	},
	
	hide: function()
	{
		this.shown = false;
		this.container.hide();
		this.fireEvent('hide');
	},
	
	reset: function()
	{
		this.set('value', '');
		this.fireEvent('reset');
	},
	
	search: function(e)
	{
		this.fireEvent('change', [e,(this.get('value').length >= this.options.minLength)]);
	},
	
	get: function(key)
	{
		return this.input.get(key);
	},

	set: function(key, value)
	{
		this.input.set(key, value);
	},	
});
