/**
 * BackendImprovedContextMenu is based on Mootools ContextMenu of David Walsh which is
 * licensed by a MIT style license
 */
var BackendImprovedContextMenu = new Class(
{
    Extends: DavidWalshContextMenu,


	/**
	 * override initialize because we need to start context menu later
	 */
	initialize:	function(options)
	{
		this.options.targets = '';
		this.options.hideActions = false;
		
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
        
        // kill Contao 2.11 context menu of edit action
        $$('a.contextmenu').each(function(el) {
        	el.removeEvents();
        });
	},
	
	
	/**
	 * get things started 
	 */
    generate: function() 
    {
    	this.targets = $$(this.options.targets);
    	
    	this.menuButton = new Element('a');
    	this.menuButton.addClass('beit_ContextMenuToggler');
		new Element('img').setProperty('src', 'system/modules/be_improved_theme/assets/menu.png').inject(this.menuButton);
		
        /* all elemnts */
        this.targets.each(function(el) {
        	this.handleTarget(el);
        }, this);
        
        window.addEvent('ajax_change', function(e) {
        	newTargets = $$(this.options.targets);
        	
        	newTargets.each(function(target) {
        		if(!this.targets.contains(target)) {
        			this.handleTarget(target);
        		}
        	}, this);
        	
        }.bind(this));

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
     * add another target for context menu
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
	 * @param string id
	 */
    generateEmptyMenu: function(id) 
    { 
	    var ul = new Element('ul');
	    if(id != undefined) ul.setProperty('id', id);
	    ul.addClass('beit_contextMenu');
	    return ul;
	},
	
	
	/**
	 * handle target of context menu
	 * @param Element
	 */
	handleTarget : function(el)
	{
		// hide buttons
    	el.getElements('.tl_right_nowrap, .tl_right, .tl_content_right').each(function(operations) {       		
    		if(!this.options.hideActions)
    		{
    			if(operations.getChildren().length < 2)
    			{
    				return;    				
    			}
    			
    			operations.getChildren().each(function(child) {
	    			var href = child.getProperty('href');
	    			
	    			// do not hide past buttons
	    			if(href == undefined || (!href.test('act=cut') && !child.getElement('img').getProperty('src').test('pasteafter.gif')))
	    			{
	    				child.hide();        				
	    			}
	        	});
	        	
	        	var newButton = this.menuButton.clone();	        	
	        	newButton.addEvent('click', function(e) {
	        		e.stopPropagation();
	        		el.fireEvent(this.options.trigger, e);
	        	}.bind(this));
	        	
	        	var pos = 'bottom';
	        	
	        	if($$('.header_clipboard').length > 0) {
	        		pos = 'top';
	        	}

	        	operations.appendText(' ');
	        	newButton.inject(operations, pos);    			
    		}
    	}, this);
    	
    	
        /* show the menu */
        el.addEvent(this.options.trigger, function(e) 
        {
            //enabled?
            if(!this.options.disabled && el.getElement('.beit_ContextMenuToggler') != undefined) {
            	el.addClass('beit_hover');
            	
            	if(!this.options.hideActions)
            	{
            		el.getElement('.beit_ContextMenuToggler').addClass('beit_hover');            		
            	}            	
            	
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
	},
	
	
	/**
	 * parse row nodes
	 * @param Element 
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
			// remove invisible class for edit header icon of contao
			node.removeClass('invisible');
			
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
