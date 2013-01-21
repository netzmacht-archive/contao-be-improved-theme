/*
---
description:     ContextMenu

authors:
  - David Walsh (http://davidwalsh.name)

license:
  - MIT-style license

requires:
  core/1.2.1:   '*'
  more/1.2.1:   'Fx.*'

provides:
  - ContextMenu
...
*/
var ContextMenu = new Class({

    //implements
    Implements: [Options,Events],

    //options
    options: {
        actions: {},
        menu: 'contextmenu',
        labels: [],
        stopEvent: true,
        targets: 'body',
        trigger: 'contextmenu',
        offsets: { x:0, y:0 },
        onShow: function(){},
        onHide: function(){},
        onClick: function(){},
        fadeSpeed: 200
    },

    //initialization
    initialize: function(options) {
        //set options
        this.setOptions(options);

        //option diffs menu
        this.menu = this.parseNodes(this.options.labels, this.options.menu).inject(document.body);
        
        this.targets = $$(this.options.targets);

        //fx
        this.fx = new Fx.Tween(this.menu, { property: 'opacity', duration:this.options.fadeSpeed });

        //hide and begin the listener
        this.hide().startListener();

        //hide the menu
        this.menu.setStyles({ position:'absolute',top:'-900000px',display:'block' });
    },

    //get things started
    startListener: function() {
        /* all elemnts */
        this.targets.each(function(el) {
            /* show the menu */
            el.addEvent(this.options.trigger,function(e) {
                //enabled?
                if(!this.options.disabled) {
                    //prevent default, if told to
                    if(this.options.stopEvent) { e.stop(); }
                    //record this as the trigger
                    this.options.element = document.id(el);
                    //position the menu
                    
                    this.menu.setStyles({
                        top: (e.page.y + this.options.offsets.y),
                        left: (e.page.x + this.options.offsets.x),
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
    },
    
    // takes a nodes array and turns it into a <ul>
    parseNodes: function(nodes,id) { 
    var ul = new Element('ul');
    if(id != undefined)ul.setProperty('id', id);
    for(var i=0; i<nodes.length; i++) {
        ul.appendChild(this.parseNode(nodes[i]));
    }
    return ul;
},

// takes a node object and turns it into a <li>
    parseNode: function (node) { 
   var li = new Element('li');
   if(node.href == undefined)node.href = void(0);
   var new_a = new Element('a', {'href' : node.href, 'class' : node.clas, 'text' : node.title}).inject(li);
   new_a.addEvent('click',function(e) {
                if(!new_a.hasClass('disabled') && node.href != undefined) {
                    this.execute(node.href.split('#')[1],document.id(this.options.element));
                    this.fireEvent('click',[new_a,e]);
            }
            }.bind(this));
   if(node.nodes) li.grab(this.parseNodes(node.nodes));
    return li;
},
    
    //show menu
    show: function() {
        this.fx.start(1);
        this.fireEvent('show');
        this.shown = true;
        return this;
    },

    //hide the menu
    hide: function() {
        if(this.shown)
        {
            this.fx.start(0);
            this.fireEvent('hide');
            this.shown = false;
        }
        return this;
    },

    //disable an item
    disableItem: function(item) {
        this.menu.getElements('a[href$=' + item + ']').addClass('disabled');
        return this;
    },

    //enable an item
    enableItem: function(item) {
        this.menu.getElements('a[href$=' + item + ']').removeClass('disabled');
        return this;
    },

    //diable the entire menu
    disable: function() {
        this.options.disabled = true;
        return this;
    },

    //enable the entire menu
    enable: function() {
        this.options.disabled = false;
        return this;
    },

    //execute an action
    execute: function(action,element) {
        if(this.options.actions[action]) {
            this.options.actions[action](element,this);
        }
        return this;
    }

});
