import React from 'react';

const SquareButton = ({ checked = false, onChange, ledColor = '#FF9900', className = '', style = {} }) => {
  return (
    <div 
      className={`flex items-center justify-center cursor-pointer group w-full h-full aspect-square ${className}`} 
      style={style}
      onClick={() => onChange && onChange(!checked)}
    >
      <div 
        className="w-full h-full rounded-md shadow-md flex items-center justify-center overflow-hidden transition-all group-hover:bg-[#999999]" 
        style={{ 
          backgroundColor: checked ? ledColor : '#666666',
          boxShadow: checked ? `0 0 12px ${ledColor}CC` : ''
        }}
      >
        {checked && <div className="bg-white rounded-sm shadow-sm w-1/2 h-1/2" />}
      </div>
    </div>
  );
};

export default SquareButton;
