
import { useInView, useIsomorphicLayoutEffect } from '@react-spring/web';
import { KeyframeOptions } from 'motion'
import { animate } from 'motion/react';
import { span } from 'motion/react-client'
import React, { useRef } from 'react'
import { element } from 'three/tsl';

type AnimatedCounterProps = {
    from: number,
    to: number,
    animationOptions?: KeyframeOptions
}

const AnimatedCounter = ({from, to, animationOptions}: AnimatedCounterProps) => {
    const ref = useRef<HTMLSpanElement>(null)

    useIsomorphicLayoutEffect (() =>{
        const element = ref.current;

        if(!element) return;

        element.textContent = String(from)

        const controls = animate(from, to,{
            duration: 1.5,
            ease: "easeOut",
            ...animationOptions,
            onUpdate(value){
                element.textContent = value.toFixed(0);
            }
        })

        return() =>{
            controls.stop();
        }
    },[ref, from, to])

  return (
    <span ref={ref}/> 
  )
    
}

export default AnimatedCounter;