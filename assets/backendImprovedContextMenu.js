/**
 * BackendImprovedContextMenu is based on Mootools ContextMenu of David Walsh which is
 * licensed by a MIT style license
 */
BackendImprovedContextMenu = new Class(
{
    Extends: ContextMenu,

	/**
	 * override initialize because we need to start context menu later
	 */
	initialize:	function(options)
	{
		this.options.targets = '';
		
        //set options
        this.setOptions(options);

        //option diffs menu
        this.menu = this.generateEmptyMenu(this.options.menu).inject(document.body);    

        //fx
        this.fx = new Fx.Tween(this.menu, { property: 'opacity', duration:this.options.fadeSpeed });

        //hide and begin the listener
        this.hide();

        //hide the menu
        this.menu.setStyles({ position:'absolute',top:'-900000px',display:'block' });
	},
	
	/**
	 * get things started 
	 */
    execute: function() 
    {
    	this.targets = $$(this.options.targets);
    	
    	var menuButton = new Element('a');
    	menuButton.addClass('beit_ContextMenuToggler');
		new Element('img').setProperty('src', 'system/modules/be_improved_theme/assets/menu.png').inject(menuButton);
		
        /* all elemnts */
        this.targets.each(function(el) 
        {
        	// hide buttons
        	el.getElements('.tl_right_nowrap, .tl_right, .tl_content_right').each(function(operations) {        		
        		if(operations.getChildren().length < 2)
        		{
        			return;
        		}
        		
        		operations.getChildren().each(function(child) {
        			var href = child.getProperty('href');
        			
        			if(href == undefined || !href.test('act=cut'))
        			{
        				child.hide();        				
        			}
	        	});
	        	
	        	var newButton = menuButton.clone();	        	
	        	newButton.addEvent('click', function(e) {
	        		e.stopPropagation();
	        		console.log(this.options.trigger);
	        		el.fireEvent(this.options.trigger, e);
	        	}.bind(this));
	        	
	        	var space = document.createTextNode(' ');
	        	operations.appendChild(space);
	        	newButton.inject(operations);
        	}, this);
        	
        	
            /* show the menu */
            el.addEvent(this.options.trigger, function(e) 
            {
                //enabled?
                if(!this.options.disabled) {
                	el.addClass('beit_hover');
                	el.getElement('.beit_ContextMenuToggler').addClass('beit_hover')
                	
                    //prevent default, if told to
                    if(this.options.stopEvent) { e.stop(); }
                    //record this as the trigger
                    this.options.element = document.id(el);
                    //position the menu
                    
                    this.parseRowNodes(el);
                    
                    var xPos = e.page.x + this.options.offsets.x;
                    var parentPos = el.getPosition().x + el.getSize().x;

                    if ((this.menu.getSize().x + xPos) > parentPos)
                    {
                    	this.menu.setStyle('left', parentPos - this.menu.getSize().x - this.options.offsets.x - 10);
                    }
                    else
                    {
                    	this.menu.setStyle('left', xPos);
                    }
                                        
                    this.menu.setStyles({
                        top: (e.page.y + this.options.offsets.y),                       
                        position: 'absolute',
                        'z-index': '2000'
                    });
                    //show the menu
                    this.show();
                }
            }.bind(this));
        },this);

        //hide on body click
        document.id(document.body).addEvent('click', function() {
            this.hide();
        }.bind(this));
        
        // fix issue that context menu could overlay click area if it is hidden
        this.addEvent('hide', function() {
        	this.menu.setStyles({ position:'absolute',top:'-900000px',display:'block' });
        	$$('.beit_hover').each(function(el) {
        		el.removeClass('beit_hover');
    		});
        }.bind(this));
    },
    
    /**
     * 
     */
    addTarget: function(target)
    {
    	if(this.options.targets == '')
    	{
    		this.options.targets = target;
    	}
    	else
    	{
    		this.options.targets = this.options.targets + ', ' + target;
    	}
    },
    
    /**
	 * generate empty menu
	 */
    generateEmptyMenu: function(id) 
    { 
	    var ul = new Element('ul');
	    if(id != undefined) ul.setProperty('id', id);
	    ul.addClass('beit_contextMenu');
	    return ul;
	},
	
	/**
	 * 
	 */
	parseRowNodes: function(row)
	{
		var operations = row.getElement('.tl_right_nowrap, .tl_right, .tl_content_right');
		var elements = operations.getChildren();
		
		//empty menu
		this.menu.empty();
		
		elements.each(function(origin) {
			// do not agg toggler itself and disabled icons to context menu
			if(origin.hasClass('beit_ContextMenuToggler') || origin.get('tag') != 'a') {
				return;
			}
			
			var li = new Element('li');
			
			// create copy, so original will not be deleted
			node = origin.clone();
			node.show();
			
			// handle links
			node.addEvent('click',function(e) {
                if(!node.hasClass('disabled') && node.href != undefined) {
                    this.fireEvent('click',[node,e]);
            	}
          	}.bind(this));
	          
			if(node.getElement('img') != undefined && node.getElement('img').getProperty('alt') != undefined)
			{
				var title = new Element('span');
			
				title.set('html', node.getElement('img').getProperty('alt'));
				title.inject(node);				
			}
			
			node.inject(li);		
			li.inject(this.menu);		
		}, this);
	},

});
