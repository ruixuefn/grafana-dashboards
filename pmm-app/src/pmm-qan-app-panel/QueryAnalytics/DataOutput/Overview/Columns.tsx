import React from 'react';
import PolygonChart from 'react-plugins-deps/components/PolygonChart/PolygonChart';
import LatencyChart from 'react-plugins-deps/components/LatencyChart/LatencyChart';
import { Humanize } from 'react-plugins-deps/components/helpers/Humanization';
import ManageColumns from '../ManageColumns/ManageColumns';
import './OverviewTable.scss';
import { METRIC_CATALOGUE } from '../MetricCatalogue';
import Tooltip from 'antd/es/tooltip';
import { Divider } from 'antd';
import { GROUP_BY_OPTIONS } from '../GroupByControl/GroupByControl';
import { css } from 'emotion';

const Styling = {
  rowNumber: css`
    word-wrap: normal;
    word-break: normal;
  `,
  mainMetric: mainMetricColumnWidth => css`
    word-wrap: break-word !important;
    word-break: break-word !important;
    overflow: hidden !important;
    text-overflow: ellipsis !important;
    white-space: nowrap !important;
    max-width: ${mainMetricColumnWidth - 40}px !important;
  `,
  tooltipHeader: css`
    padding: 10px;
    padding-left: 30px;
    font-size: 14px;
  `,
  metricsWrapper: css`
    padding-left: 20px !important;
    padding-right: 20px !important;
    padding-bottom: 10px !important;
  `,
  singleMetricWrapper: css`
    margin-top: 15px !important;
    margin-bottom: 15px !important;
  `,
  metricName: css`
    margin-left: 10px !important;
  `,
  metricsListDivider: css`
    background: #a9a9a9 !important;
    margin: 0 !important;
  `,
};

const MAIN_METRIC_MIN_WIDTH = 470;
const MAIN_METRIC_VALUE_WIDTH = 90;
export const TABLE_X_SCROLL = 1250;
export const TABLE_Y_SCROLL = 450;
const COLUMN_WIDTH = 250;
const ROW_NUMBER_COLUMN_WIDTH = 30;

export const getDefaultColumns = (groupBy, pageNumber, pageSize, columns) => {
  const mainMetricColumnWidth = Math.max(TABLE_X_SCROLL - columns * COLUMN_WIDTH - ROW_NUMBER_COLUMN_WIDTH, MAIN_METRIC_MIN_WIDTH);
  // @ts-ignore
  const groupByLabel = GROUP_BY_OPTIONS.find(({ value }) => value === groupBy).label;
  return [
    {
      title: '#',
      dataIndex: 'rowNumber',
      key: 'rowNumber',
      fixed: 'left',
      width: ROW_NUMBER_COLUMN_WIDTH,
      render: (text, record, index) => <div className={Styling.rowNumber}>{index === 0 ? '' : (pageNumber - 1) * pageSize + index}</div>,
    },
    {
      dataIndex: 'mainMetric',
      fixed: 'left',
      width: mainMetricColumnWidth,
      title: () => `Group by ${groupByLabel}`,
      ellipsis: true,
      className: 'overview-main-column',
      render: (text, record) => {
        return <div className={Styling.mainMetric(mainMetricColumnWidth)}>{record.fingerprint || record.dimension || 'TOTAL'}</div>;
      },
    },
  ];
};

export const getOverviewColumn = (metricName, columnIndex, totalValues, orderBy) => {
  const metric = METRIC_CATALOGUE[metricName];
  let sortOrder: boolean | string = false;
  if (orderBy === metricName) {
    sortOrder = 'ascend';
  } else if (orderBy === `-${metricName}`) {
    sortOrder = 'descend';
  }
  return {
    sorter: true,
    key: metricName,
    sortOrder: sortOrder,
    width: columnIndex === 0 ? COLUMN_WIDTH * 1.5 : COLUMN_WIDTH,
    title: () => <ManageColumns placeholder={metricName} currentMetric={metric} width={'100%'} />,
    render: (text, item) => {
      const stats = item.metrics[metricName].stats;
      // @ts-ignore
      const tooltipData = [
        { header: 'Per sec', value: Humanize.transform(stats.qps || stats.sum_per_sec, 'number') },
        { header: 'Sum', value: stats.sum && Humanize.transform(stats.sum, metric.pipeTypes.sumPipe) },
        { header: 'From total', value: ((stats.sum_per_sec / totalValues.metrics[metricName].stats.sum_per_sec) * 100).toFixed(2) + ' %' },
      ].filter(tooltip => tooltip.value);

      const minStr = `${Humanize.transform(stats.min)}`;
      const maxStr = `${Humanize.transform(stats.max)}`;
      const avgStr = `${Humanize.transform(stats.avg)}`;
      const p99Str = `${stats.p99 ? `${Humanize.transform(stats.p99)}` : ''}`;

      const latencyTooltipData = [
        { header: '⌜ Min', value: minStr },
        { header: '⌟ Max', value: maxStr },
        { header: '◦ Avg', value: avgStr },
        { header: '• 99%', value: p99Str },
      ].filter(element => element.value);

      // @ts-ignore
      const polygonChartProps = { width: COLUMN_WIDTH * 1.2 - MAIN_METRIC_VALUE_WIDTH, data: item.sparkline };
      const MetricsList = ({ data }) => {
        return (
          <div className={Styling.metricsWrapper}>
            {data.map((item, index, list) => {
              return (
                <div className={Styling.singleMetricWrapper}>
                  <span className={Styling.metricName}>{`${item.header} : ${item.value}`}</span>
                  {list.length === index + 1 ? null : <Divider className={Styling.metricsListDivider} />}
                </div>
              );
            })}
          </div>
        );
      };
      return (
        <div className={'overview-content-column'}>
          {columnIndex === 0 && <PolygonChart {...polygonChartProps} />}
          <Tooltip
            getPopupContainer={() => document.querySelector('#antd') || document.body}
            placement="left"
            overlayClassName={'overview-column-toolkit'}
            title={
              <div>
                <div className={Styling.tooltipHeader}>{metric.humanizeName}</div>
                <Divider style={{ background: '#363434', margin: '0' }} />
                <MetricsList data={tooltipData} />
                <Divider style={{ background: '#666666', margin: '0' }} />
                {metricName === 'query_time' && <LatencyChart {...{ data: stats }} />}
                <MetricsList data={latencyTooltipData} />
              </div>
            }
          >
            <span className="summarize" style={{ marginLeft: 'auto' }}>
              {Humanize.transform(stats.qps || stats.sum_per_sec, 'number')} {metric.units}
            </span>
          </Tooltip>
        </div>
      );
    },
  };
};
