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

$GLOBALS['TL_DCA']['tl_user']['subpalettes']['useImprovedTheme'] = 'useImprovedThemeContextMenu';
$GLOBALS['TL_DCA']['tl_user']['palettes']['__selector__'][] = 'useImprovedTheme';

$arrPalettes = array('admin', 'custom', 'default', 'extend', 'group');
if(!$GLOBALS['TL_CONFIG']['forceImprovedTheme'] && !$GLOBALS['TL_CONFIG']['requireImprovedTheme']) 
{
	// only show font awesome setting in user palette if the font awesome is not forced	
	// themed can set the required fonnt awesome tag
	$arrPalettes[] = 'login'; 
}

foreach($arrPalettes as $palette) {
	$GLOBALS['TL_DCA']['tl_user']['palettes'][$palette] = str_replace (
		'backendTheme',
		'backendTheme,useImprovedTheme',
		$GLOBALS['TL_DCA']['tl_user']['palettes'][$palette]
	);	
}

$GLOBALS['TL_DCA']['tl_user']['fields']['useImprovedTheme'] = array
(
	'label'                   => &$GLOBALS['TL_LANG']['tl_user']['useImprovedTheme'],
	'default'                 => 1,
	'exclude'                 => true,
	'inputType'               => 'checkbox',
	'eval'                    => array('submitOnChange' => true, 'tl_class'=>'clr w50 m12'),
	'sql'                     => "char(1) NOT NULL default ''"
);

$GLOBALS['TL_DCA']['tl_user']['fields']['useImprovedThemeContextMenu'] = array
(
	'label'                   => &$GLOBALS['TL_LANG']['tl_user']['useImprovedThemeContextMenu'],
	'default'                 => 1,
	'exclude'                 => true,
	'inputType'               => 'select',
	'options'				  => array(1, 2),
	'reference'				  => &$GLOBALS['TL_LANG']['tl_user']['useImprovedThemeContextMenuOptions'],
	'eval'                    => array('includeBlankOption' => true, 'tl_class'=>'w50'),
	'sql'                     => "char(1) NOT NULL default ''"
);