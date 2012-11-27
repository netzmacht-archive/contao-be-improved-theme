<?php

/**
 * Contao Open Source CMS
 * 
 * Copyright (C) 2005-2012 Leo Feyer
 * 
 * @package   be_improved_theme
 * @author    David Molineus <http://www.netzmacht.de>
 * @license   GNU/LGPL 
 * @copyright Copyright 2012 David Molineus netzmacht creative 
 * 
 */  

namespace Netzmacht;
use Backend;

/**
 * prove class for parseTemplate hook
 */
class BackendImprovedTheme extends Backend
{
	
	/**
	 * add stylesheet or javascript to the template depending on settings
	 */
	public function onParseTemplate ($objTemplate)
	{
		if(TL_MODE != 'BE') 
		{
			return;
		}
		
		$this->import('BackendUser', 'User');
		
		if($GLOBALS['TL_CONFIG']['forceImprovedTheme'] || $GLOBALS['TL_CONFIG']['requireImprovedTheme'] || $this->User->useImprovedTheme)
		{			
			$objTemplate->javascripts .= '<scipt src="system/modules/be_improved_theme/assets/script.js"></script>';
			$objTemplate->stylesheets .= '<link rel="stylesheet" href="system/modules/be_improved_theme/assets/style.css">';
		}
	}

}
