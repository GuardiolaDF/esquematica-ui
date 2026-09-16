import React from 'react';

const HorizontalSlider = ({ value = 50, className = '', style = {} }) => {
  return (
    <div className={`flex items-center justify-center w-full h-full ${className}`} style={style}>
      <div className="bg-[#121212] rounded-full shadow-inner flex items-center relative cursor-pointer w-full aspect-[8/1]">
        <div 
          className="bg-[#D9D9D9] rounded-full absolute shadow-md h-full aspect-square transition-all" 
          style={{ left: `${value}%`, transform: 'translateX(-50%)' }}
        ></div>
      </div>
    </div>
  );
};

export default HorizontalSlider;
