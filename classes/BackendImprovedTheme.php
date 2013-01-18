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
	public function onParseTemplate (&$objTemplate)
	{
		
		if(TL_MODE != 'BE' || !in_array($objTemplate->getName(), $GLOBALS['useBackendImprovedOnTemplates'])) 
		{
			return;
		}
		
		$this->import('BackendUser', 'User');
		
		if($GLOBALS['TL_CONFIG']['forceImprovedTheme'] || $GLOBALS['TL_CONFIG']['requireImprovedTheme'] || $this->User->useImprovedTheme)
		{	
			$objTemplate->javascripts .= '<script src="system/modules/be_improved_theme/assets/script.js"></script>' . "\r\n";
			$objTemplate->stylesheets .= '<link rel="stylesheet" href="system/modules/be_improved_theme/assets/style.css">' . "\r\n";
		}
	}

}
