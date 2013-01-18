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
	 * 
	 */
	protected $arrConfig;
	
	
	/**
	 * 
	 */
	public function __construct()
	{
		$this->arrConfig = &$GLOBALS['TL_CONFIG']['backendImprovedConfig'];
		$this->import('BackendUser', 'User');
	}
	
	/**
	 * add stylesheet or javascript to the template depending on settings
	 */
	public function onParseTemplate (&$objTemplate)
	{
		
		if(TL_MODE != 'BE' || !in_array($objTemplate->getName(), $GLOBALS['TL_CONFIG']['useBackendImprovedOnTemplates'])) 
		{
			return;
		}
		
		if($this->useImprovedTheme())
		{	
			$objTemplate->javascripts .= '<script src="system/modules/be_improved_theme/assets/script.js"></script>' . "\r\n";
			$objTemplate->stylesheets .= '<link rel="stylesheet" href="system/modules/be_improved_theme/assets/style.css">' . "\r\n";
		}
	}
	
	
	/**
	 * 
	 */
	public function onLoadDataContainer($strTable)
	{
		if(!$this->useImprovedTheme())
		{
			return;
		}

		// support configuration by the dca
		if(isset($GLOBALS['TL_DCA'][$strTable]['config']['row_operation']))
		{
			$this->addRowOperationClass($strTable, $GLOBALS['TL_DCA'][$strTable]['config']['row_operation']);
		}
		
		// check if edit operation exists
		elseif(isset($GLOBALS['TL_DCA'][$strTable]['list']['operations']['edit']))
		{
			$this->addRowOperationClass($strTable, 'edit');
		}

		// check if show operation exists as fallback 
		elseif (isset($GLOBALS['TL_DCA'][$strTable]['list']['operations']['show']))
		{
			$this->addRowOperationClass($strTable, 'show');			
		}
	}
	
	
	/**
	 * add row operation class to operation
	 * 
	 * @param string table
	 * @param string operation
	 */
	protected function addRowOperationClass($strTable, $strOperation)
	{
		// no attribute set, just add class
		if(!isset($GLOBALS['TL_DCA'][$strTable]['list']['operations'][$strOperation]['attributes']))
		{
			$GLOBALS['TL_DCA'][$strTable]['list']['operations'][$strOperation]['attributes'] = 'class="row_operation"';
		}
		
		// class attribut exists, add another class
		elseif(preg_match('/class\s*=/', $GLOBALS['TL_DCA'][$strTable]['list']['operations'][$strOperation]['attributes']))
		{
			$GLOBALS['TL_DCA'][$strTable]['list']['operations'][$strOperation]['attributes'] = preg_replace(
				'/(class\s*=\s*(\'|"))/', '\1row_operation', $GLOBALS['TL_DCA'][$strTable]['list']['operations'][$strOperation]['attributes']
			);
		}
		
		// append class
		else
		{
			$GLOBALS['TL_DCA'][$strTable]['list']['operations'][$strOperation]['attributes'] .= ' class="row_operation"';
		}
	}
	
	
	/**
	 * check if improved them is used
	 */
	protected function useImprovedTheme()
	{
		return $GLOBALS['TL_CONFIG']['forceImprovedTheme'] || $GLOBALS['TL_CONFIG']['requireImprovedTheme'] || $this->User->useImprovedTheme;
	}

}
