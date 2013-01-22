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


/**
 * prove class for parseTemplate hook
 */
class BackendImprovedTheme extends Backend
{
	
	/**
	 * store callbacks
	 * @var array
	 */
	protected static $arrCallbacks = array();
	
	/**
	 * generated output which will be passed to the template
	 * @var array
	 */
	protected static $arrScripts = array();
	
	
	/**
	 * import backend user
	 */
	public function __construct()
	{
		parent::__construct();
		$this->import('BackendUser', 'User');
	}
	
	
	/**
	 * add stylesheet to the template depending on settings
	 * 
	 * @param Template
	 */
	public function onParseTemplate (&$objTemplate)
	{
		if(TL_MODE != 'BE' || !$this->useImprovedTheme() || !in_array($objTemplate->getName(), $GLOBALS['TL_CONFIG']['useBackendImprovedOnTemplates'])) 
		{
			return;
		}
		
		$objTemplate->stylesheets .= '<link rel="stylesheet" href="system/modules/be_improved_theme/assets/style.css">' . "\r\n";
	}
	
	
	/**
	 * call callbacks in after generating output
	 * 
	 * @param string
	 * @param string
	 * @return string
	 */
	public function onParseBackendTemplate($strContent, $strTemplate)
	{
		// check template
		if(!$this->useImprovedTheme() || !in_array($strTemplate, $GLOBALS['TL_CONFIG']['useBackendImprovedOnTemplates']))
		{
			return $strContent;
		}
		
		// run throw callbacks
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
		
		// add javascript to the body of the page
		if(!empty(static::$arrScripts))
		{
			$strGenerated = implode("\r\n", static::$arrScripts);
			$strContent = preg_replace('/<\/body>/', '<script>document.addEvent(\'domready\', function(e) {' . "\r\n" . $strGenerated . '});</script>\0', $strContent, 1);
		}
		
		return $strContent;		
	}
	
	
	/**
	 * onload data container
	 * 
	 * @param string
	 */
	public function onLoadDataContainer($strTable)
	{
		if(!$this->useImprovedTheme())
		{
			return;
		}

		// switch to tl_files table
		if($strTable != 'tl_files' && in_array($this->Environment->script, array('contao/file.php', 'contao/files.php')))
		{
			$strTable = 'tl_files';
			$this->loadDataContainer('tl_files');
			$this->User->useImprovedThemeContextMenu = false;
		}
		elseif(!$this->isActiveTable($strTable))
		{
			return;
		}
		
		// get config from dca
		$arrConfig = isset($GLOBALS['TL_DCA'][$strTable]['improved_theme']) ? $GLOBALS['TL_DCA'][$strTable]['improved_theme'] : array();
		
		// header callback
		if(isset($arrConfig['header_callback']) && $arrConfig['header_callback'] !== false)
		{
			static::$arrCallbacks[] = $GLOBALS['TL_DCA'][$strTable]['improved_theme']['header_callback'];
		}
		// callback can be disabled in the dca
		elseif ($arrConfig['header_callback'] !== false && in_array($GLOBALS['TL_DCA'][$strTable]['list']['sorting']['mode'], array(3,4))) 
		{
			static::$arrCallbacks[] = 'callbackHeaderOperation';
			$strClass = isset($arrConfig['header_class']) ? $arrConfig['header_class'] : 'tl_header';
			$this->addBackendRowTarget($strClass);
			
			if($this->User->useImprovedThemeContextMenu > 0)
			{
				$this->addContextMenu($strClass);	
			}
		}

		// row operation callback
		if(isset($arrConfig['row_operation_callback']))
		{
			static::$arrCallbacks[] = $arrConfig['row_operation_callback'];
		}		
		// support configuration by the dca
		if(isset($arrConfig['row_operation']))
		{
			$this->addRowOperationClass($strTable, $arrConfig['row_operation']);
		}
		// check if edit operation exists
		elseif(isset($GLOBALS['TL_DCA'][$strTable]['list']['operations']['edit']))
		{
			$this->addRowOperationClass($strTable, 'edit');
		}

		// fallback option if operation does not exists or user have no access
		if(isset($arrConfig['row_operation_fallback']))
		{
			$this->addRowOperationClass($strTable, $arrConfig['row_operation_fallback']);
		}
		elseif (isset($GLOBALS['TL_DCA'][$strTable]['list']['operations']['show']))
		{
			$this->addRowOperationClass($strTable, 'show', 'beit_fallback');			
		}
		
		// add extra java script
		if(isset($arrConfig['javascript']))
		{
			$GLOBALS['TL_JAVASCRIPT'][] = $arrConfig['javascript'];
		}
		
		// make customizeable, add every registered row class
		if(isset($arrConfig['row_class']))
		{
			$strClass = $arrConfig['row_class'];
			
		}
		// default class for mode 1
		elseif(in_array($GLOBALS['TL_DCA'][$strTable]['list']['sorting']['mode'], array(1,2)))
		{
			$strClass = 'tl_listing tr';
		}
		// default class for mode 5 and 6
		// use str pos to ensure extensions like cloud-api also work
		elseif(strpos($GLOBALS['TL_DCA'][$strTable]['config']['dataContainer'], 'Folder') > 0 || in_array($GLOBALS['TL_DCA'][$strTable]['list']['sorting']['mode'], array(5, 6)))
		{
			$strClass = 'tl_listing li.tl_file';
			
			if($this->User->useImprovedThemeContextMenu)
			{
				$this->addContextMenu('tl_listing li.tl_folder');
			}
		}
		// default class for all other modes
		else
		{
			$strClass = 'tl_content';
		}
		
		$this->addBackendRowTarget($strClass);
		
		if($this->User->useImprovedThemeContextMenu)
		{
			$this->addContextMenu($strClass);
		}
	}


	/**
	 * add BackendRowTarget for passed class
	 * 
	 * @param string
	 */
	protected function addBackendRowTarget($strClass)
	{		
		if(!static::$arrScripts['backendRowTarget'])
		{
			$GLOBALS['TL_JAVASCRIPT'][] = 'system/modules/be_improved_theme/assets/backendRowTarget.js';
			
			$strScript = 'var connector = new BackendRowTarget(); ' . "\r\n";
			$strScript .= 'connector.stopPropagation(\'.tl_listing .tl_left > a, .tl_right_nowrap > a, .tl_right > a,.tl_content_right > a\');' . "\r\n"; 
			static::$arrScripts['backendRowTarget'] = $strScript;
		}

		// disable auto generated tips if context menu is activated
		if($this->User->useImprovedThemeContextMenu)
		{
			static::$arrScripts['backendRowTarget'] .= 'connector.connect(\'.' . $strClass . '\', true);' . "\r\n";
		}
		else
		{
			static::$arrScripts['backendRowTarget'] .= 'connector.connect(\'.' . $strClass . '\');' . "\r\n";
		}		
	}
	
	
	/**
	 * add context menu to generated scripts
	 * 
	 * @param string class
	 */
	protected function addContextMenu($strClass)
	{
		if(!static::$arrScripts['contextMenu'])
		{
			$GLOBALS['TL_JAVASCRIPT'][] = 'system/modules/be_improved_theme/assets/contextMenu.js';
			$GLOBALS['TL_JAVASCRIPT'][] = 'system/modules/be_improved_theme/assets/backendImprovedContextMenu.js';
			
			$strHide = $this->User->useImprovedThemeContextMenu == '2' ? 'true' : 'false';
			static::$arrScripts['contextMenu'] = 'var contextMenu = new BackendImprovedContextMenu({hideActions: ' . $strHide . ' }); ' . "\r\n";
			static::$arrScripts['contextMenuExecute'] = 'contextMenu.execute();' . "\r\n";
		}
		
		static::$arrScripts['contextMenu'] .= 'contextMenu.addTarget(\'.' . $strClass . '\');' . "\r\n";	
	}
	
	
	/**
	 * add row operation class to operation
	 * 
	 * @param string table
	 * @param string operation
	 */
	protected function addRowOperationClass($strTable, $strOperation, $strClass='beit_target')
	{
		// no attribute set, just add class
		if(!isset($GLOBALS['TL_DCA'][$strTable]['list']['operations'][$strOperation]['attributes']))
		{
			$GLOBALS['TL_DCA'][$strTable]['list']['operations'][$strOperation]['attributes'] = 'class="' . $strClass . '"';
		}
		
		// class attribut exists, add another class
		elseif(preg_match('/class\s*=/', $GLOBALS['TL_DCA'][$strTable]['list']['operations'][$strOperation]['attributes']))
		{
			$GLOBALS['TL_DCA'][$strTable]['list']['operations'][$strOperation]['attributes'] = preg_replace(
				'/(class\s*=\s*(\'|"))/', '\1' . $strClass . ' ', $GLOBALS['TL_DCA'][$strTable]['list']['operations'][$strOperation]['attributes']
			);
		}
		
		// append class attribute
		else
		{
			$GLOBALS['TL_DCA'][$strTable]['list']['operations'][$strOperation]['attributes'] .= ' class="' . $strClass . '"';
		}
	}
	
	
	/**
	 * add target to the toggling icon in the file tree
	 * 
	 * @var string
	 * @return string
	 */
	protected function callbackFileTreeToggleIcon($strContent)
	{
		return preg_replace('/href="([^"]*)do=files&amp;tg([^"]*)"/', '\0 class="beit_target"', $strContent);
	}

	
	/**
	 * add target to header link
	 * 
	 * @var string
	 * @return string
	 */
	protected function callbackHeaderOperation($strContent)
	{
		return preg_replace('/(<div\s*class="tl_header"(.*)<a\s*href="([^"]*)")/Us', '\0 class="beit_target"', $strContent, 1);
	}
	
	
	/**
	 * check if table is the active table
	 * 
	 * @param string
	 * @return bool
	 */
	public function isActiveTable($strTable)
	{		
		if($this->Input->get('table') != '')
		{
			return $strTable == $this->Input->get('table');
		}
		
		$strModule = $this->Input->get('do');
		
		foreach ($GLOBALS['BE_MOD'] as $arrGroup) 
		{
			if(isset($arrGroup[$strModule]))
			{
				return $strTable == $arrGroup[$strModule]['tables'][0];
			}			
		}
		
		return false;
	}
	
	
	/**
	 * check if improved them is used
	 */
	protected function useImprovedTheme()
	{
		return $GLOBALS['TL_CONFIG']['forceImprovedTheme'] || $GLOBALS['TL_CONFIG']['requireImprovedTheme'] || $this->User->useImprovedTheme;
	}

}
