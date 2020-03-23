import React, { useCallback, useContext, useEffect, useState } from 'react';
import { Divider, Icon, Select } from 'antd';
import { METRIC_CATALOGUE } from '../MetricCatalogue';
import { StateContext } from '../../StateContext';
import './ManageColumns.less';

const { Option } = Select;

const ManageColumns = props => {
  const {
    dispatch,
    state: { columns },
  } = useContext(StateContext);
  const [availableColumns, setAvailableColumns] = useState(Object.values(METRIC_CATALOGUE));
  useEffect(() => {
    setAvailableColumns(Object.values(METRIC_CATALOGUE).filter(metric => !columns.find(item => item === metric.simpleName)));
  }, [columns]);
  const changeColumn = useCallback(
    column => {
      if (props.onlyAdd) {
        dispatch({
          type: 'ADD_COLUMN',
          payload: {
            column: column,
          },
        });
      } else {
        dispatch({
          type: 'REPLACE_COLUMN',
          payload: {
            column: column,
            oldColumn: props.currentMetric,
          },
        });
      }
    },
    [props.currentMetric, props.onlyAdd]
  );

  const removeColumn = useCallback(() => {
    dispatch({
      type: 'REMOVE_COLUMN',
      payload: {
        column: props.currentMetric,
      },
    });
  }, [props.currentMetric]);
  // @ts-ignore
  return (
    <div className={!props.onlyAdd ? 'manage-columns' : ''} onClick={e => e.stopPropagation()}>
      <Select
        optionLabelProp="label"
        showSearch={true}
        style={{ width: props.width || '160px' }}
        placeholder={!props.onlyAdd ? props.placeholder && METRIC_CATALOGUE[props.placeholder].humanizeName : 'Add column'}
        onChange={changeColumn}
        dropdownMatchSelectWidth={false}
        value={undefined}
        showArrow={false}
        dropdownRender={menu => (
          <div style={{ width: 400 }} className={'add-column-wrapper'}>
            {menu}
            <Divider style={{ margin: '4px 0' }} />
            {!props.onlyAdd && (
              <div style={{ padding: '4px 8px', cursor: 'pointer' }} onMouseDown={e => e.preventDefault()} onClick={removeColumn}>
                <Icon type="minus" /> Remove column
              </div>
            )}
          </div>
        )}
      >
        {availableColumns.map(item => (
          <Option key={item.simpleName} label={item.humanizeName}>
            {item.humanizeName}
          </Option>
        ))}
      </Select>
    </div>
  );
};

export default ManageColumns;
