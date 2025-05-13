import React from 'react';
import { TimePicker } from 'antd';
// import moment from 'moment';

const TimeRangeSelector = ({ value, onChange }) => {
  const timePickerProps = {
    format: 'hh:mm A',
    use12Hours: true,
    minuteStep: 15,
    style: { width: '100%' }
  };

  const onTimeChange = (times) => {
    if (times && times[0] && times[1]) {
      const startTime = times[0];
      const endTime = times[1];

      // Only prevent end time from being same as start time
      if (startTime.isSame(endTime)) {
        return;
      }
    }
    
    onChange(times);
  };

  return (
    <TimePicker.RangePicker 
      {...timePickerProps}
      value={value}
      onChange={onTimeChange}
      placeholder={['Start Time', 'End Time']}
    />
  );
};

export default TimeRangeSelector;