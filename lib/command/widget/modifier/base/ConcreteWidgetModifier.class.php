<?php
/**
 * Base class for edit, list and other widget types modifier classes
 * When widget definition returns from JS side it is unserialized to xml data
 *
 * @author Łukasz Wojciechowski <luwo@appflower.com>
 */
abstract class ConcreteWidgetModifier
{
    /**
     * This method gets new widget representation created on JS side
     * It can modify it specially for concrete widget type and return modified definition
     * This class will also get information regarding if modfified widget is new widget
     *
     * @param array $definition
     * @param bool  $newWidgetMode
     * @return array modified definition
     */
    abstract function modify(Array $definition, $newWidgetMode = false);
    
}
