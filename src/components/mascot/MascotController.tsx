import React from 'react';
import { TurkeyMascot, type MascotAnimationState } from './TurkeyMascot';

export type { MascotAnimationState };

export interface MascotControllerProps {
  character?: 'turkey';
  animationState: MascotAnimationState;
  size?: number;
  className?: string;
  onAnimationComplete?: () => void;
}

export const MascotController: React.FC<MascotControllerProps> = ({
  character = 'turkey',
  animationState,
  size = 112,
  className = '',
  onAnimationComplete,
}) => {
  if (character === 'turkey') {
    return (
      <TurkeyMascot
        animationState={animationState}
        size={size}
        className={className}
        onAnimationComplete={onAnimationComplete}
      />
    );
  }

  return (
    <TurkeyMascot
      animationState={animationState}
      size={size}
      className={className}
      onAnimationComplete={onAnimationComplete}
    />
  );
};
