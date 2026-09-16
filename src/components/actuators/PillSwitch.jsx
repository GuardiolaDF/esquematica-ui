import React from 'react';

const PillSwitch = ({
  label,
  checked = false,
  onChange,
  scale = 1,
  className = '',
  style = {}
}) => {
  const cqw = (val) => `${val * scale}cqw`;

  return (
    <div className={`flex flex-col items-center ${className}`} style={{ ...style }}>
      <div 
        onClick={() => onChange && onChange(!checked)}
        className="bg-[#111] rounded-full shadow-inner border border-[#333] relative cursor-pointer group"
        style={{ width: cqw(4.5), height: cqw(2.2), marginBottom: cqw(0.4) }}
      >
        <div 
          className="absolute bg-[#D9D9D9] rounded-full shadow-md transition-all duration-300 group-hover:bg-white group-hover:shadow-[0_0_10px_rgba(255,153,0,0.6)]" 
          style={{ 
            width: cqw(1.8), 
            height: cqw(1.8), 
            top: cqw(0.15),
            left: checked ? cqw(2.4) : cqw(0.2),
            backgroundColor: checked ? '#FF9900' : ''
          }} 
        />
      </div>
      {label && (
        <span className="text-neutral-400 font-light text-center leading-none" style={{ fontSize: cqw(1.8) }}>
          {label}
        </span>
      )}
    </div>
  );
};

export default PillSwitch;
