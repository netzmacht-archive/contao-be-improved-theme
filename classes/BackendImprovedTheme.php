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
	
	/*
	 * 
	 */
	protected static $arrCallbacks = array();
	
	
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
	public function onParseBackendTemplate($strContent, $strTemplate)
	{
		if(!in_array($strTemplate, $GLOBALS['TL_CONFIG']['useBackendImprovedOnTemplates']))
		{
			return $strContent;
		}
		
		foreach (static::$arrCallbacks as $callback) 
		{
			if(is_string($callback))
			{
				$strContent = $this->$callback($strContent);
			}
			else
			{
				$this->import($callback[0]);
				$strContent = $this->$callback[1]($strContent);
			}			
		}
		
		return $strContent;		
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
		
		// header callback
		if(isset($GLOBALS['TL_DCA'][$strTable]['improved_theme']['header_callback']))
		{
			static::$arrCallbacks[] = $GLOBALS['TL_DCA'][$strTable]['improved_theme']['header_callback'];
		}
		elseif (in_array($GLOBALS['TL_DCA'][$strTable]['list']['sorting']['mode'], array(3,4,6)) && !in_array($strTable, $this->arrConfig['header_operation_blacklist'])) 
		{
			static::$arrCallbacks[] = 'callbackHeaderOperation';			
		}

		// row operation callback
		if(isset($GLOBALS['TL_DCA'][$strTable]['improved_theme']['row_operation_callback']))
		{
			static::$arrCallbacks[] = $GLOBALS['TL_DCA'][$strTable]['improved_theme']['row_operation_callback'];
		}
		
		// support configuration by the dca
		if(isset($GLOBALS['TL_DCA'][$strTable]['improved_theme']['row_operation']))
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
				'/(class\s*=\s*(\'|"))/', '\1row_operation ', $GLOBALS['TL_DCA'][$strTable]['list']['operations'][$strOperation]['attributes']
			);
		}
		
		// append class
		else
		{
			$GLOBALS['TL_DCA'][$strTable]['list']['operations'][$strOperation]['attributes'] .= ' class="row_operation"';
		}
	}
	
	
	/**
	 * 
	 */
	protected function callbackFileTreeToggleIcon($strContent)
	{
		return preg_replace('/href="([^"]*)do=files&amp;tg([^"]*)"/', '\0 class="row_operation"', $strContent);
	}

	
	/**
	 * 
	 */
	protected function callbackHeaderOperation($strContent)
	{
		return preg_replace('/(<div\s*class="tl_header"(.*)<a\s*href="([^"]*)")/Us', '\0 class="row_operation"', $strContent, 1);
	}
	
	
	/**
	 * check if improved them is used
	 */
	protected function useImprovedTheme()
	{
		return $GLOBALS['TL_CONFIG']['forceImprovedTheme'] || $GLOBALS['TL_CONFIG']['requireImprovedTheme'] || $this->User->useImprovedTheme;
	}

}
