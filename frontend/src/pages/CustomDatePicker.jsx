import React from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './CustomDatePicker.css'; // We'll create this file for custom styles

const CustomDatePicker = ({ selected, onChange, ...props }) => {
  return (
    <DatePicker
      selected={selected}
      onChange={onChange}
      dateFormat="dd/MM/yyyy"
      className="custom-datepicker"
      calendarClassName="custom-calendar"
      {...props}
    />
  );
};

export default CustomDatePicker;