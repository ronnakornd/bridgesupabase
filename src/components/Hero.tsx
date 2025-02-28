import React from 'react';
import Image from 'next/image';
import HeroImage from '@/asset/Untitled design.svg';


const Hero: React.FC = () => {
    return (
        <div className="hero min-h-screen bg-base-200">
            <div className="hero-content flex-col lg:flex-row-reverse">
                <div className="lg:w-1/2">
                    <Image
                        src={HeroImage}
                        alt="Hero"
                        width={500}
                        height={500}
                    />
                </div>
                <div>
                    <h1 className="text-7xl font-opunbold font-bold">Welcome to <br></br>the Bridge</h1>
                    <p className="py-6">
                        world class education for Thai students!
                    </p>
                    <button className="btn btn-primary">Get Started</button>
                </div>
            </div>
        </div>
    );
};

export default Hero;