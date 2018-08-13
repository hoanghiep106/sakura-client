import React from 'react';

const LoadingIndicator = (props) => (
  <div className={`spinner ${props.color}`}>
    <div className="bounce1" />
    <div className="bounce2" />
    <div className="bounce3" />
    <div className="bounce4" />
  </div>
);

export default LoadingIndicator;