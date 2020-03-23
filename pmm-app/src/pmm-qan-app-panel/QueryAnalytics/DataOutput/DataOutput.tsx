import OverviewTable from './QueryAnalyticsOverview/OverviewTable/OverviewTable';
import QueryDetails from './QueryDetails/QueryDetails';
import React, { useCallback, useContext, useState } from 'react';
import Split from 'react-split';
import { StateContext } from '../StateContext';
import './DataOutput.scss';
import { Button, Pagination } from 'antd';
import AddColumn from './AddColumn';

const PAGE_SIZE_OPTIONS = ['10', '50', '100'];
const DataOutput = () => {
  const {
    dispatch,
    state: { pageNumber, pageSize, firstSeen },
  } = useContext(StateContext);
  const [total, setTotal] = useState(30);

  const changeFirstSeen = useCallback(() => {
    dispatch({
      type: 'CHANGE_FIRST_SEEN',
      payload: {
        firstSeen: !firstSeen,
      },
    });
  }, [firstSeen]);

  const changePageNumber = useCallback(pageNumber => {
    dispatch({
      type: 'CHANGE_PAGE',
      payload: {
        pageNumber,
      },
    });
  }, []);

  const changePageSize = useCallback((current, pageSize) => {
    dispatch({
      type: 'CHANGE_PAGE_SIZE',
      payload: {
        pageSize,
      },
    });
  }, []);

  return (
    <div>
      <div className={'filters-header'} style={{ padding: '5px 0px', height: '50px' }}>
        <h5 style={{ margin: '3px', marginRight: '15px' }}>Queries overview</h5>
        <Button type="link" style={{ padding: 0, height: 'auto', marginLeft: '20px' }} onClick={changeFirstSeen}>
          {firstSeen ? `Show all Queries` : `Show first Seen`}
        </Button>
        <div style={{ marginLeft: 'auto' }}>
          <Pagination
            showSizeChanger={true}
            pageSizeOptions={PAGE_SIZE_OPTIONS}
            defaultCurrent={1}
            defaultPageSize={10}
            current={pageNumber}
            pageSize={pageSize}
            total={total}
            onShowSizeChange={changePageSize}
            onChange={changePageNumber}
          />
        </div>
        <div style={{ marginLeft: '10px' }}>
          <AddColumn onlyAdd={true} />
        </div>
      </div>
      <Split
        sizes={[25, 75]}
        minSize={100}
        gutterSize={10}
        direction="vertical"
        cursor="row-resize"
        className={'splitter-wrapper'}
        elementStyle={(dimension, size, gutterSize) => {
          return { height: `calc(${size}% - ${gutterSize}px)`, 'overflow-y': `scroll` };
        }}
      >
        <OverviewTable setTotal={setTotal} />
        <QueryDetails />
      </Split>
    </div>
  );
};

export default DataOutput;
