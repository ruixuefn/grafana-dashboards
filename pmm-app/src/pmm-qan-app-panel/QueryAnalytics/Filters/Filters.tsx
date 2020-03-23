import React, { ReactElement, useContext, useState } from 'react';
import Humanize from '../../../react-plugins-deps/helpers/humanize';
import './Filters.scss';
import { Divider } from 'antd';
import { StateContext } from '../StateContext';
import FiltersService from '../storage/filtersService';
import { CheckboxField } from '../../../react-plugins-deps/components/FieldsComponents/Checkbox/Checkbox';
import { useForm } from 'react-final-form-hooks';
import { Form as FormFinal } from 'react-final-form';
import AutocompleteSearch from './AutocompleteSearch';

const checkboxGroup = (form, name, items, showAll) => {
  const itemsList = items
    .filter(item => item.value)
    .filter(item => {
      if (!showAll) {
        return item.checked;
      }
      return true;
    })
    .map(item => {
      return (
        <div className={'filter-label'}>
          <span className={'filter-name'}>
            <CheckboxField form={form} name={'testerok'} label={item.value} checked={item.checked} />
          </span>
          <span className={'percentage'}>{Humanize.formatPercent(item.main_metric_percent)}</span>
        </div>
      );
    });
  return (
    <div>
      {itemsList.length ? <Divider>{name}</Divider> : null}
      {itemsList}
    </div>
  );
};

const checkboxGroups = [
  {
    name: 'Environment',
    dataKey: 'environment',
  },
  {
    name: 'Cluster',
    dataKey: 'cluster',
  },
  {
    name: 'Replication Set',
    dataKey: 'replication_set',
  },
  {
    name: 'Database',
    dataKey: 'database',
  },
  {
    name: 'Schema',
    dataKey: 'schema',
  },
  {
    name: 'Node Name',
    dataKey: 'node_name',
  },
  {
    name: 'Service Name',
    dataKey: 'service_name',
  },
  {
    name: 'Client Host',
    dataKey: 'client_host',
  },
  {
    name: 'User Name',
    dataKey: 'username',
  },
  {
    name: 'Service Type',
    dataKey: 'service_type',
  },
  {
    name: 'Node Type',
    dataKey: 'node_type',
  },
  {
    name: 'City',
    dataKey: 'city',
  },
  {
    name: 'Availability Zone',
    dataKey: 'az',
  },
];

const Filters = () => {
  const [showAll, showSetAll] = useState(true);
  const context = useContext(StateContext);
  const filters = FiltersService.getQueryOverviewFiltersList(context.selectedVariables);
  return (
    <FormFinal
      onSubmit={() => {}}
      render={(): ReactElement => {
        const { form, handleSubmit } = useForm({
          onSubmit: () => {},
          validate: () => {},
          initialValues: {},
        });
        // @ts-ignore
        return (
          <form onSubmit={handleSubmit} className="add-instance-form app-theme-dark">
            <div className={'filters-header'} style={{ padding: '5px 0px', height: '50px' }}>
              <h5 style={{ marginRight: '15px' }}>Filters</h5>
              {showAll ? (
                <a href="#" className={'filter-switchers'} onClick={showSetAll.bind(null, false)}>
                  Show Selected
                </a>
              ) : (
                <a href="#" className={'filter-switchers'} onClick={showSetAll.bind(null, true)}>
                  Show All
                </a>
              )}
              <a href="#" className={'filter-switchers'} style={{ marginLeft: 'auto' }}>
                Reset All
              </a>
            </div>
            <AutocompleteSearch />
            <div className={'query-analytics-filters-wrapper'}>
              {checkboxGroups.map(group => {
                return checkboxGroup(form, group.name, filters[group.dataKey].name, showAll);
              })}
            </div>
          </form>
        );
      }}
    />
  );
};

export default Filters;
