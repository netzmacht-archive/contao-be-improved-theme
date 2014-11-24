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
$GLOBALS['TL_HOOKS']['initializeSystem'][] = array('BackendImprovedTheme', 'onInitializeSystem');
$GLOBALS['TL_HOOKS']['parseBackendTemplate'][] = array('BackendImprovedTheme', 'onParseBackendTemplate');
$GLOBALS['TL_HOOKS']['loadDataContainer'][] = array('BackendImprovedTheme', 'onLoadDataContainer');

// define templates on which improved theme will be used
$GLOBALS['TL_CONFIG']['useBackendImprovedOnTemplates'] = array('be_main', 'be_files', 'be_picker');
