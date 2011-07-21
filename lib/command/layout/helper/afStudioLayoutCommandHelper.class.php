<?php
/**
 * Studio Layout Command Helper class 
 * 
 * @author Sergey Startsev <startsev.sergey@gmail.com>
 */
class afStudioLayoutCommandHelper
{
    /**
     * Returns ExtJS data 
     * @return array the tree structure
     * @author Sergey Startsev
     */
    public static function processGetList($aPageList)
    {
    	$tree = array();
        
        foreach ($aPageList as $app => $aPage) {
            
            $treeNode['text'] = $app;
            $treeNode['type'] = 'app';
            
            if (count($aPage) > 0) {
                foreach ($aPage as $page) {
                    $treeNode['children'][] = array(
                        'text' => $page['text'],
                    	'iconCls' => 'icon-layout',
                        'xmlPath' => $page['xmlPath'],
                        'leaf' => true,
                    	'type' => 'page'
                    );
                }
            } else {
                $treeNode['leaf'] = true;
                $treeNode['iconCls'] = 'icon-folder';
            }
            
            $tree[] = $treeNode;
        }
    	
    	return $tree;
    }
    
    /**
     * Prepare widgets list for output
     *
     * @param array $modules - list of modules names 
     * @param array $params - needed parameters security path, action_path, xml_paths and xml_names
     * @param string $name - parent name - name of application or plugin
     * @param string $type - apps/plugins
     * @return array
     * @author Sergey Startsev
     */
    public static function processGetWidgetList($modules, $params, $name, $type)
    {
        $aExtWidgets = array();
        
        foreach ($modules as $module) {
			if (count($params[$module]['xml_names']) > 0) {	
			    $children = array(
                    'text' => $module,
                    'type' => 'module',
                    'app' => $name
    			);
                
                $children['leaf'] = false;
                
				foreach ($params[$module]['xml_names'] as $xk => $xmlName) {
					$children['children'][] = array(
                        'app'           => $name,
                        'module'        => $module,
					    'widget'        => str_replace('.xml', '', $xmlName),
                        'widgetUri'     => $module.'/'.str_replace('.xml', '', $xmlName),
                        'type'          => 'xml',
                        'text'          => $xmlName,
                        'securityPath'  => $params[$module]['security_path'],
                        'xmlPath'       => $params[$module]['xml_paths'][$xk],
                        'actionPath'    => $params[$module]['action_path'],
                        'leaf'          => true
					);
				}
				$aExtWidgets['children'][] = $children;
			} 
        }
        
        if (!empty($aExtWidgets)) {
            $aExtWidgets['text'] = $name;
            $aExtWidgets['type'] = $type;
        }
        
        return $aExtWidgets;
    }
    
}
