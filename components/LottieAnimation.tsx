import React from 'react';
import Lottie from 'lottie-react';

interface LottieAnimationProps {
    animationData: any;
    width?: number;
    height?: number;
    loop?: boolean;
    autoplay?: boolean;
    speed?: number;
    className?: string;
}

const LottieAnimation: React.FC<LottieAnimationProps> = ({ 
    animationData, 
    width = 100, 
    height = 100, 
    loop = true, 
    autoplay = true,
    speed = 1,
    className = ''
}) => {
    const style = {
        width: `${width}px`,
        height: `${height}px`,
    };

    return (
        <div className={`transition-all duration-300 ease-out ${className}`}>
            <Lottie 
                animationData={animationData} 
                style={style}
                loop={loop}
                autoplay={autoplay}
                speed={speed}
            />
        </div>
    );
};

export default LottieAnimation;