/**
 * BackendImprovedFileTree toggles rows in the article tree
 * 
 * @author David Molineus <http://www.netzmacht.de>
 * @package be_improved_theme
 */
var BackendImprovedArticleTree = new Class({
	
	Extends: BackendImprovedTree,
	
	/**
	 * initialize article toggle set default options
	 */
	initialize: function(options)
	{
		this.options.targets = '.tl_listing.tl_tree_xtnd li.tl_folder';
		this.options.breakClasses = ['tl_folder', 'parent'];
		this.parent(options);
	},
	
	/**
	 * get children elements until break class is found
	 * @param Element
	 * @return Array
	 */
	getChildren: function(element)
	{
		var doBreak = false;
		var elements = element.getAllNext();
		var filtered = new Array();
		
		for(var i=0; i< elements.length; i++) 
		{
			element = elements[i];

			for (var j = 0; j < this.options.breakClasses.length; j++) 
			{					
				if (element.hasClass(this.options.breakClasses[j])) {
					doBreak = true;
					break;
				}
			}
			
			if(doBreak)
			{
				break;
			}
			
			filtered.push(element);
		}
				
		return filtered;
	},
	 
});
