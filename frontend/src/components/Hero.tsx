import React from 'react';

const Hero: React.FC = () => {
  return (
    <div className="relative overflow-hidden bg-neutral-darker text-white">
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: "url('/images/Binary Code Background.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-neutral-darker/95 via-neutral-dark/90 to-neutral-darker/95" />
      
      <div className="relative container mx-auto px-4 py-16 md:py-24">
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="flex-shrink-0">
            <img 
              src="/images/UNNES Logo.png" 
              alt="UNNES Logo" 
              className="w-32 h-32 md:w-40 md:h-40 object-contain drop-shadow-lg"
            />
          </div>

          <div className="flex-1 text-center md:text-left">
            <div className="inline-block mb-4">
              <span className="px-4 py-2 bg-accent-pink/20 border border-accent-pink/40 rounded-full text-accent-pink text-sm font-semibold tracking-wide">
                UNIVERSITAS NEGERI SEMARANG
              </span>
            </div>
            
            <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight text-white">
              AES S-box Research Analyzer
            </h1>
            
            <p className="font-body text-lg md:text-xl text-primary-light mb-6 max-w-3xl">
              Comprehensive Research Platform for AES S-box Modification through Affine Matrices Exploration and Parameter Optimization
            </p>

            <div className="flex flex-wrap gap-3 justify-center md:justify-start">
              <div className="px-4 py-2 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
                <span className="text-sm text-primary-light">GF(2⁸) Arithmetic</span>
              </div>
              <div className="px-4 py-2 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
                <span className="text-sm text-primary-light">Matrix Exploration</span>
              </div>
              <div className="px-4 py-2 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
                <span className="text-sm text-primary-light">Parameter Tweaking</span>
              </div>
              <div className="px-4 py-2 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
                <span className="text-sm text-primary-light">Cryptanalysis Testing</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-12">
          <path d="M0 48h1440V0s-187.5 48-480 48S480 0 480 0 292.5 48 0 48z" fill="white"/>
        </svg>
      </div>
    </div>
  );
};

export default Hero;

