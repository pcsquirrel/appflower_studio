<?php
/**
 * Edit widget modifier
 *
 * @author Łukasz Wojciechowski <luwo@appflower.com>
 * @author Sergey Startsev <startsev.sergey@gmail.com>
 */
class EditWidgetModifier extends ConcreteWidgetModifier 
{
    /**
     * Model criteria fetcher method
     */
    const MODEL_CRITERIA_FETCHER = 'ModelCriteriaFetcher';
    
    /**
     * Fetcher method from model criteria
     */
    const FETCHER_METHOD = 'getDataForComboWidget';
    
    /**
     * Datasource class name
     *
     * @var string
     */
    private $datasource;
    
    /**
     * Modify process
     *
     * @param Array $definition 
     * @param string $newWidgetMode 
     * @return array
     * @author Łukasz Wojciechowski 
     * @author Sergey Startsev
     */
    public function modify(Array $definition, $newWidgetMode = false) 
    {
        $this->datasource = $this->processGetDatasource($definition);
        
        if ($newWidgetMode) {
            $definition = $this->searchForAndModifyForeignTableFields($definition);
        }
        return $definition;
    }
    
    /**
     * Getting datasource class name
     *
     * @return string
     * @author Sergey Startsev
     */
    public function getDatasource()
    {
        return $this->datasource;
    }
    
    /**
     * Search and modify foreign table fields
     *
     * @param string $definition 
     * @return array
     * @author Łukasz Wojciechowski 
     */
    private function searchForAndModifyForeignTableFields(Array $definition)
    {
        if (isset($definition['i:fields']) ) {
            $fields = $definition['i:fields'];
            
            if (isset($fields['i:field'])) {
                $fields = $fields['i:field'];
                
                if (is_array($fields) && count($fields) > 0) {
                    foreach ($fields as $fieldKey => $field) {
                        $modifiedField = $this->checkAndModifyForeignTableField($field);
                        if ($modifiedField) {
                            $definition['i:fields']['i:field'][$fieldKey] = $modifiedField;
                        }
                    }
                }
            }
        }
        
        return $definition;
    }
    
    /**
     * Check and modify foreign table field
     *
     * @param Array $fieldDefinition 
     * @return array
     * @author Łukasz Wojciechowski
     */
    private function checkAndModifyForeignTableField(Array $fieldDefinition)
    {
        $peerClassName = $this->getDatasource();

        /* @var $tableMap TableMap */
        $tableMap = call_user_func("{$peerClassName}::getTableMap");
        $columnName = $fieldDefinition['name'];
        
        if ($tableMap->hasColumn($columnName)) {
            /* @var $column ColumnMap */
            $column = $tableMap->getColumn($columnName);
            
            if ($column->isForeignKey()) {
                $relatedColumnTableMap = $column->getRelation()->getForeignTable();
                $relatedModelName = $relatedColumnTableMap->getPhpName();

                $fieldDefinition['type'] = 'combo';
                $fieldDefinition['selected'] = '{'.$columnName.'}';
                $fieldDefinition['i:value'] = array(
                    'type' => 'orm',
                    'i:class' => self::MODEL_CRITERIA_FETCHER,
                    'i:method' => array(
                        'name' => self::FETCHER_METHOD,
                        'i:param' => array(
                            array(
                                'name' => 'does_not_matter',
                                '_content' => $relatedModelName
                            )
                        )
                    )
                );

            }
        }

        return $fieldDefinition;
    }
    
    /**
     * Process getting datasource class
     *
     * @param Array $definition 
     * @return string
     * @author Sergey Startsev
     */
    private function processGetDatasource(Array $definition)
    {
        if (isset($definition['i:datasource'])) {
            if (isset($definition['i:datasource']['i:class'])) {
                return $definition['i:datasource']['i:class'];
            }
        }

        return null;
    }
    
}
