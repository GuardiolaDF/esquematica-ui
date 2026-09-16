import React from 'react';

const StepperDisplay = ({ value = 0, onIncrement, onDecrement, className = '', style = {} }) => {
  return (
    <div className={`flex items-center justify-between w-full h-full gap-1 ${className}`} style={style}>
      <div className="bg-[#ECECEC] text-black font-black rounded-md flex items-center justify-center shadow-inner w-[70%] h-full aspect-square text-xl">
        {value}
      </div>
      <div className="flex flex-col justify-between h-full w-[25%] py-[5%]">
        <button onClick={onIncrement} className="w-full aspect-[2/1] bg-[#444] hover:bg-[#FF9900] transition-colors cursor-pointer" style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }} />
        <button onClick={onDecrement} className="w-full aspect-[2/1] bg-[#444] hover:bg-[#FF9900] transition-colors cursor-pointer" style={{ clipPath: 'polygon(0% 0%, 100% 0%, 50% 100%)' }} />
      </div>
    </div>
  );
};

export default StepperDisplay;
