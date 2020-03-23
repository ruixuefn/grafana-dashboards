import React, { useReducer } from 'react';
import { ParseQueryParamDate } from '../../react-plugins-deps/components/helpers/time-parameters-parser';

const initialState = {} as any;

export const StateContext = React.createContext(initialState);

const DEFAULT_COLUMNS = ['load', 'num_queries', 'query_time'];
const FILTERS_NAMES = [
  'environment',
  'cluster',
  'replication_set',
  'database',
  'schema',
  'node_name',
  'service_name',
  'client_host',
  'username',
  'service_type',
  'node_type',
  'city',
  'az',
];

class ContextActions {
  constructor() {}

  static setFilters(query) {
    return FILTERS_NAMES.reduce((result, filterName) => {
      const filters = query.getAll(`var-${filterName}`);
      if (!filters.length) {
        return result;
      }

      if (filters[0] === 'All' || filters[0] === '') {
        return result;
      }

      result[filterName] = filters;
      return result;
    }, {});
  }

  static generateURL(state) {
    // read parameters and create new url
    // @ts-ignore
    const labels =
      state.labels &&
      Object.keys(state.labels)
        .map(key => {
          // @ts-ignore
          const variables = state.labels[key];
          return variables.map(variable => `var-${key}=${variable}`).join('&');
        })
        .filter(Boolean)
        .join('&');
    const columnsQuery = state.columns ? `columns=${JSON.stringify(state.columns)}` : '';
    const groupBy = state.groupBy ? `group_by=${state.groupBy}` : '';
    const filterByQuery = state.queryId ? `filter_by=${state.queryId}` : '';
    const orderBy = state.orderBy ? `order_by=${state.orderBy}` : '';
    // TODO: replace crutch with right redirect
    return `${window.location.pathname}?${[columnsQuery, filterByQuery, labels, orderBy, groupBy].filter(Boolean).join('&')}`;
  }

  static parseURL(query) {
    const urlParams = {} as any;
    urlParams.from = ParseQueryParamDate.transform(query.get('from') || 'now-12h', 'from')
      .utc()
      .format('YYYY-MM-DDTHH:mm:ssZ');
    urlParams.to = ParseQueryParamDate.transform(query.get('to') || 'now', 'to')
      .utc()
      .format('YYYY-MM-DDTHH:mm:ssZ');
    urlParams.columns = JSON.parse(query.get('columns')) || DEFAULT_COLUMNS;
    urlParams.labels = ContextActions.setFilters(query);
    urlParams.pageNumber = 1;
    urlParams.pageNumber = 10;
    urlParams.orderBy = query.get('order_by') || 'load';
    urlParams.queryId = query.get('filter_by');
    urlParams.querySelected = !!query.get('filter_by');
    urlParams.groupBy = query.get('group_by') || 'queryid';
    return urlParams;
  }

  static setLabels(filters) {
    const labels = {};
    Object.keys(filters)
      .filter(filter => filters[filter])
      .forEach(filter => {
        const [group, value] = filter.split(':');
        if (labels[group]) {
          labels[group].push(value);
        } else {
          labels[group] = [value];
        }
      });
    return labels;
  }
}

export const UrlParametersProvider = ({ children }) => {
  const query = new URLSearchParams(window.location.search);
  const [state, dispatch] = useReducer(
    (state, action) => {
      let columns;
      let newState;
      switch (action.type) {
        case 'SET_LABELS':
          newState = { ...state, labels: ContextActions.setLabels(action.payload.labels), pageNumber: 1 };
          break;
        case 'RESET_LABELS':
          newState = { ...state, labels: {}, pageNumber: 1 };
          break;
        case 'SELECT_QUERY':
          newState = { ...state, queryId: action.payload.queryId, querySelected: true };
          break;
        case 'ADD_COLUMN':
          columns = state.columns.slice();
          columns.push(action.payload.column);
          newState = {
            ...state,
            columns: columns,
          };
          break;

        case 'REPLACE_COLUMN':
          columns = state.columns.slice();
          columns[columns.indexOf(action.payload.oldColumn.simpleName)] = action.payload.column;
          newState = {
            ...state,
            columns: columns,
            orderBy: action.payload.oldColumn.simpleName === action.payload.orderBy ? columns[0] : action.payload.orderBy,
          };
          break;

        case 'REMOVE_COLUMN':
          columns = state.columns.slice();
          columns.splice(columns.indexOf(action.payload.column.simpleName), 1);
          newState = {
            ...state,
            columns: columns,
            orderBy: action.payload.column === action.payload.orderBy ? columns[0] : action.payload.orderBy,
          };
          break;
        case 'CHANGE_PAGE':
          newState = {
            ...state,
            pageNumber: action.payload.pageNumber,
          };
          delete newState.queryId;
          break;
        case 'CHANGE_PAGE_SIZE':
          newState = {
            ...state,
            pageSize: action.payload.pageSize,
            pageNumber: 1,
          };
          delete newState.queryId;
          break;
        case 'CHANGE_SORT':
          newState = {
            ...state,
            orderBy: action.payload.orderBy,
          };
          delete newState.queryId;
          break;
        case 'CHANGE_GROUP_BY':
          newState = {
            ...state,
            groupBy: action.payload.groupBy,
          };
          delete newState.queryId;
          break;
      }
      const newUrl = ContextActions.generateURL(newState);
      history.pushState({}, 'test', newUrl);
      return newState;
    },
    { ...ContextActions.parseURL(query) }
  );

  return <StateContext.Provider value={{ state, dispatch }}>{children}</StateContext.Provider>;
};
