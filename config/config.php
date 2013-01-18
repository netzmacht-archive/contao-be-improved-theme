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
 **/

// define hook
$GLOBALS['TL_HOOKS']['parseTemplate'][] = array('BackendImprovedTheme', 'onParseTemplate');
$GLOBALS['TL_HOOKS']['loadDataContainer'][] = array('BackendImprovedTheme', 'onLoadDataContainer');
$GLOBALS['SETUP_EXT_HOOK']['be_improved_theme'][] = array('BackendImprovedTheme', 'onParseTemplate');

// define templates on which improved theme will be used
$GLOBALS['TL_CONFIG']['useBackendImprovedOnTemplates'] = array('be_main', 'be_files', 'be_picker');

$GLOBALS['TL_CONFIG']['backendImprovedConfig'] = array
(
	'row_peration' => array
	(
		'__default__'	=> 'edit',
		'__fallback__'	=> 'show',
		//'tl_content'	=> 'delete',
	),
);