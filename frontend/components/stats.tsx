'use client';
import { useEffect, useRef, useState } from "react";
import AnimatedCounter from "./ui/animated-counter";
import SplitText from "./ui/split-text";


const handleAnimationComplete = () => {
    console.log('All letters have animated!');
  };



export default function StatsSection() {
    const myref = useRef(null);
    const [ElementVisible, SetElementVisible] = useState(false);

    useEffect(() =>{
        const observer = new IntersectionObserver((entries) =>{
            const entry = entries[0]; 
            SetElementVisible(entry.isIntersecting)
        });

         if (myref.current) {
            observer.observe(myref.current);
        }

        return () => observer.disconnect();
    },[])
    return (
        <section className="py-12 md:py-20">
            <div className="mx-auto max-w-5xl space-y-8 px-6 md:space-y-16">
                <div className="relative z-10 mx-auto max-w-xl space-y-6 text-center">
                    <SplitText
                    text="Hello, Tailwind!"
                    className="text-4xl font-medium lg:text-5xl"
                    delay={75}
                    animationFrom={{ opacity: 0, transform: 'translate3d(0,50px,0)' }}
                    animationTo={{ opacity: 1, transform: 'translate3d(0,0,0)' }}
                    easing="easeOutCubic"
                    threshold={0.2}
                    rootMargin="-50px"
                    onLetterAnimationComplete={handleAnimationComplete}
                    />
                    <p>Gemini is evolving to be more than just the models. It supports an entire to the APIs and platforms helping developers and businesses innovate.</p>
                </div>

                <div  className="grid gap-12 divide-y *:text-center md:grid-cols-3 md:gap-2 md:divide-x md:divide-y-0">
                    <div className="space-y-4" ref={myref}>
                        <div className="text-5xl font-bold">
                            +
                            {ElementVisible ? <AnimatedCounter from={0} to={1200}/> : <span/>}
                            </div>
                        <p>Stars on GitHub</p>
                    </div>
                    <div className="space-y-4">
                        <div className="text-5xl font-bold">
                            {ElementVisible ? <AnimatedCounter from={0} to={22}/> : <span/>}
                            Million
                            </div>
                        <p>Active Users</p>
                    </div>
                    <div className="space-y-4">
                        <div className="text-5xl font-bold">
                            +
                            {ElementVisible ? <AnimatedCounter from={0} to={500}/> : <span/>}
                            </div>
                        <p>Powered Apps</p>
                    </div>
                </div>
            </div>
        </section>
    )
}
