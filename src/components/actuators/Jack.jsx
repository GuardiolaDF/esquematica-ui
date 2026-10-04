import React from 'react';
import { useAppContext } from '../../contexts/AppContext';

// output-jack from Figma:
// 20x20px, bg #8A8177, border #DDD9CE, box-shadow inset control, border-radius 1004px
// Inner ellipse: 12x12px, bg #D9D9D9

const Jack = ({ compId }) => {
  const { routingOutputs } = useAppContext();
  const isOut1 = routingOutputs?.out1 === compId;
  const isOut2 = routingOutputs?.out2 === compId;
  const ringColor = isOut1 ? 'ring-blue-500' : isOut2 ? 'ring-orange-500' : '';

  return (
    <div
      className={`relative w-[20px] h-[20px] rounded-full flex items-center justify-center border border-border-subtle ${ringColor}`}
      style={{
        background: '#8A8177',
        boxShadow: 'inset 1px 2px 4px rgba(45, 45, 45, 0.22), inset -1px -1px 2px rgba(255, 255, 255, 0.78)',
      }}
    >
      <div
        className="w-[12px] h-[12px] rounded-full"
        style={{ background: '#D9D9D9' }}
      />
    </div>
  );
};

export default Jack;
