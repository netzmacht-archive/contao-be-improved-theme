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
 * BackendImprovedTheme handles theme improvements which can depend on the DCA
 * It supports a new directive in the DCA backend_improved. If no configuration
 * isset, the default values are used.
 *  
 * Followings keysare supported
 * 
 * For connecting a row in list/table view with an operation
 * - decide by which class rows are fetched, default depends on dca mode
 * 	 $GLOBALS['TL_DCA']['tl_table']['backend_improved']['row_class'] = 'tl_listing li.tl_file';
 * 
 * - disable row connecting by setting class to false
 *   $GLOBALS['TL_DCA']['tl_table']['backend_improved']['row_class'] = false;
 * 
 * - which operation will be linked to the row, default is edit
 *   $GLOBALS['TL_DCA']['tl_table']['backend_improved']['row_operation'] = 'edit'; 
 * 
 * - alternative operation if row_operation does not exists, e.g. if button is disabled
 *   $GLOBALS['TL_DCA']['tl_table']['backend_improved']['row_operation'] = 'show';
 * 
 * It is not possible to fetch header icons using the dca, so a callback can be defined to fetch the icons
 * - $GLOBALS['TL_DCA']['tl_table']['backend_improved']['header_callback'] = array('class', 'method');
 * 
 * - Header connecting can be disabled by setting callback to false
 *   $GLOBALS['TL_DCA']['tl_table']['backend_improved']['header_callback'] = false;
 * 
 * By default it is not neccessary to setup a callback. A default routine is used. But then it's possible to
 * choose the css class which defines the header
 * $GLOBALS['TL_DCA']['tl_table']['backend_improved']['header_class'] = 'tl_header';
 *  
 * Last but not least it is possible to define a tree_class which handles the toggling of the tree. 
 * - Define the javascript class
 *   $GLOBALS['TL_DCA']['tl_table']['backend_improved']['tree_class'] = 'BackendImprovedTree';
 * - Define the corresponding file, if not set it try to find the file in system/modules/be_improved_theme/assets/ClassName.js
 *   $GLOBALS['TL_DCA']['tl_table']['backend_improved']['tree_file'] = '/system/modules/custom/assets/custom.js';
 */
class BackendImprovedTheme extends Backend
{
	
	/**
	 * store callbacks
	 * @var array
	 */
	protected $arrCallbacks = array();
	
	/**
	 * generated output which will be passed to the template
	 * @var array
	 */
	protected $arrScripts = array();
	
	/**
	 * store timestamp if debug mode is enabled
	 * @var int
	 */
	protected $intDebug = null;
	
	/**
	 * combiner reference, use to collect all javascript files
	 * @var Combiner
	 */
	protected $objCombiner;
	
	/**
	 * singleton
	 * @var BackendImprovedTheme
	 */
	protected static $objInstance;
	
	
	/**
	 * import backend user
	 */
	public function __construct()
	{
		parent::__construct();
		$this->import('BackendUser', 'User');
		$this->objCombiner = new Combiner();
		
		if($this->Input->get('debug') == 1)
		{
			$this->intDebug = time();
		}
	}
	
	
	/**
	 * singleton get instance
	 * @return BackendImprovedTheme
	 */
	public static function getInstance()
	{
		if(static::$objInstance === null)
		{
			static::$objInstance = new static;
		}
		
		return static::$objInstance;
	}
	
	
	/**
	 * add stylesheet to the template depending on settings
	 * 
	 * @param Template
	 */
	public function onParseTemplate ($objTemplate)
	{
		if(TL_MODE == 'BE' && $this->useImprovedTheme() && in_array($objTemplate->getName(), $GLOBALS['TL_CONFIG']['useBackendImprovedOnTemplates'])) 
		{
			if($this->objCombiner->hasEntries())
			{
				$objTemplate->javascripts .= '<script src="' . $this->objCombiner->getCombinedFile() . '"></script>';
			}
			
			$objTemplate->stylesheets .= '<link rel="stylesheet" href="system/modules/be_improved_theme/assets/style.css">' . "\r\n";
		}
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
		
		// run through registered callbacks
		foreach ($this->arrCallbacks as $callback) 
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
		if(!empty($this->arrScripts))
		{
			$strGenerated = implode("\r\n", $this->arrScripts);
			$strContent = preg_replace('/<\/body>/', '<script>window.addEvent(\'domready\', function(e) {' . "\r\n" . $strGenerated . '});</script>\0', $strContent, 1);
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
			$this->arrCallbacks[] = $GLOBALS['TL_DCA'][$strTable]['improved_theme']['header_callback'];
		}
		// callback can be disabled in the dca
		elseif ($arrConfig['header_callback'] !== false && in_array($GLOBALS['TL_DCA'][$strTable]['list']['sorting']['mode'], array(3,4))) 
		{
			$this->arrCallbacks[] = 'callbackHeaderOperation';
			$strClass = isset($arrConfig['header_class']) ? $arrConfig['header_class'] : 'tl_header';
			$this->addBackendRowTarget($strClass);
			
			if($this->User->useImprovedThemeContextMenu > 0)
			{
				$this->addContextMenu($strClass);	
			}
		}
		
	
		// row operation connecting
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
			$this->addRowOperationClass($strTable, $arrConfig['row_operation_fallback'], 'beit_fallback');
		}
		elseif (isset($GLOBALS['TL_DCA'][$strTable]['list']['operations']['show']))
		{
			$this->addRowOperationClass($strTable, 'show', 'beit_fallback');			
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
		elseif(strpos($GLOBALS['TL_DCA'][$strTable]['config']['dataContainer'], 'Folder') > -1 || in_array($GLOBALS['TL_DCA'][$strTable]['list']['sorting']['mode'], array(5, 6)))
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
		
		if($strClass !== false)
		{
			$this->addBackendRowTarget($strClass);			
		}
		
		if($this->User->useImprovedThemeContextMenu)
		{
			$this->addContextMenu($strClass);
		}
		
		
		// tree handling, only dca based
		if(isset($arrConfig['tree_class']))
		{
			$this->addTree($strTable, $arrConfig['tree_class'], isset($arrConfig['tree_file']) ? $arrConfig['tree_file'] : null, $arrConfig['tree_options']);			
		}
	}


	/**
	 * add BackendRowTarget for passed class
	 * 
	 * @param string
	 */
	protected function addBackendRowTarget($strClass)
	{		
		if(!$this->arrScripts['backendRowTarget'])
		{
			$this->objCombiner->add('system/modules/be_improved_theme/assets/jStorage.js', $this->intDebug);
			$this->objCombiner->add('system/modules/be_improved_theme/assets/BackendImprovedRowTarget.js', $this->intDebug);
			
			$strScript = 'var connector = new BackendImprovedRowTarget(); ' . "\r\n";
			$strScript .= 'connector.stopPropagation(\'.tl_listing .tl_left > a, .tl_right_nowrap > a, .tl_right > a,.tl_content_right > a\');' . "\r\n";
			$this->arrScripts['backendRowTarget'] = $strScript;
		}

		// disable auto generated tips if context menu is activated
		if($this->User->useImprovedThemeContextMenu)
		{
			$this->arrScripts['backendRowTarget'] .= 'connector.connect(\'.' . $strClass . '\', true);' . "\r\n";
		}
		else
		{
			$this->arrScripts['backendRowTarget'] .= 'connector.connect(\'.' . $strClass . '\');' . "\r\n";
		}		
	}
	
	
	/**
	 * add context menu to generated scripts
	 * 
	 * @param string class
	 */
	protected function addContextMenu($strClass)
	{
		if(!isset($this->arrScripts['contextMenu']))
		{
			$this->objCombiner->add('system/modules/be_improved_theme/assets/ContextMenu.js', $this->intDebug);
			$this->objCombiner->add('system/modules/be_improved_theme/assets/BackendImprovedContextMenu.js', $this->intDebug);
			
			$strHide = $this->User->useImprovedThemeContextMenu == '2' ? 'true' : 'false';
			$this->arrScripts['contextMenu'] = 'var beitContextMenu = new BackendImprovedContextMenu({menu: \'beit_contextMenu\', hideActions: ' . $strHide . ' }); ' . "\r\n";
			$this->arrScripts['contextMenuGenerate'] = 'beitContextMenu.generate();' . "\r\n";
		}
		
		$this->arrScripts['contextMenu'] .= 'beitContextMenu.addTarget(\'.' . $strClass . '\');' . "\r\n";	
	}
	
	
	/**
	 * add tree to the output
	 * 
	 * @param string table
	 * @param string tree javascript class
	 * @param string assets file
	 */
	protected function addTree($strTable, $strTreeClass, $strFile=null, $arrOptions=null)
	{
		if(!isset($this->arrScripts['tree']))
		{
			$this->objCombiner->add('system/modules/be_improved_theme/assets/BackendImprovedSearchWidget.js', $this->intDebug);
			$this->objCombiner->add('system/modules/be_improved_theme/assets/BackendImprovedTree.js', $this->intDebug);			
		}
		
		$arrOptions['table'] = $strTable;
		$arrOptions['storagePrefix'] = $GLOBALS['TL_CONFIG']['websitePath'];
		
		if(!isset($arrOptions['toggleIcon'])) {
			// contao 2.11 support			
			if(isset($GLOBALS['TL_LANG']['MSC']['toggleAll']))
			{
				$arrOptions['toggleIcon'] = &$GLOBALS['TL_LANG']['MSC']['toggleAll'];
			}
			else {
				$arrOptions['toggleIcon'] = array($GLOBALS['TL_LANG']['MSC']['toggleNodes']);
			}			
		}		 
		
		$this->objCombiner->add($strFile != null ? $strFile : ('system/modules/be_improved_theme/assets/' . $strTreeClass . '.js'), $this->intDebug); 		
		$this->arrScripts['tree'] .= 'var ' . $strTable . 'Tree = new ' . $strTreeClass . '(' . json_encode($arrOptions) . ');'. "\r\n";
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
	protected function isActiveTable($strTable)
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
