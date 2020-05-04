/*
 * @format
 */
import React from 'react';

export default function Loading(props) {
  return (
    <div
      className="valign-wrapper"
      style={{
        position: 'absolute',
        top: '0',
        left: '0',
        width: '100%',
        height: '100%',
      }}>
      <div className="valign center-align" style={{width: '100%'}}>
        <h4>{props.text ? props.text : 'Loading'}</h4>
        <div className="preloader-wrapper large active">
          <div className="spinner-layer spinner-green-only">
            <div className="circle-clipper left">
              <div className="circle"></div>
            </div>
            <div className="gap-patch">
              <div className="circle"></div>
            </div>
            <div className="circle-clipper right">
              <div className="circle"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
