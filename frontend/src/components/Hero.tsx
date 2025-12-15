import React from 'react';
import VariableFontCursor from './VariableFontCursor';

const FeatureBadge: React.FC<{ text: string; delay: number }> = ({ text, delay }) => {
  return (
    <div
      className="group relative cursor-pointer transform transition-all duration-500 ease-out hover:scale-110"
      style={{ animationDelay: `${delay}s` }}
    >
      {/* Main Badge */}
      <div className="relative px-6 py-3 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 overflow-hidden transition-all duration-500 group-hover:bg-white/20 group-hover:border-white/60 group-hover:shadow-2xl group-hover:shadow-white/20">
        {/* Animated Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/0 to-white/0 group-hover:from-white/20 group-hover:via-white/20 group-hover:to-white/20 transition-all duration-700 rounded-xl"></div>

        {/* Glowing Border Effect */}
        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-white via-white to-white opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm scale-110"></div>

        {/* Shine Effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out rounded-xl"></div>

        {/* Floating Particles */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full animate-ping"
              style={{
                left: `${20 + i * 30}%`,
                top: `${40 + (i % 2) * 20}%`,
                animationDelay: `${i * 0.3 + delay}s`,
                animationDuration: '2s',
              }}
            ></div>
          ))}
        </div>

        {/* Content */}
        <div className="relative flex items-center">
          {/* Text */}
          <span className="text-sm font-semibold text-text-primary group-hover:text-black transition-all duration-500 ease-out transform group-hover:scale-105 group-hover:tracking-wider group-hover:font-bold origin-left">
            {text}
          </span>
        </div>
      </div>

      {/* 3D Shadow Effect */}
      <div className="absolute inset-0 rounded-xl bg-black/20 transform translate-y-1 translate-x-1 -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 scale-105"></div>

      {/* Ripple Effect */}
      <div className="absolute inset-0 rounded-xl bg-white/20 scale-0 group-hover:scale-100 transition-transform duration-500 ease-out opacity-0 group-hover:opacity-100"></div>
    </div>
  );
};

const Hero: React.FC = () => {
  return (
    <div className="relative overflow-hidden bg-surface-darkest text-white">
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: "url('/images/Binary Code Background.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-surface-darkest/95 via-surface-dark/90 to-surface-darkest/95" />

      <div className="relative container mx-auto px-4 py-16 md:py-24 pb-20 md:pb-28">
        <div className="flex flex-col md:flex-row items-center gap-8 md:pl-6 lg:pl-10">
          <div className="flex-shrink-0 relative">
            {/* Logo Container with Orbiting Particles */}
            <div className="relative w-40 h-40 md:w-48 md:h-48 flex items-center justify-center">
              
              {/* Orbit Ring 1 - Outer */}
              <div className="absolute inset-[-30px] md:inset-[-40px]">
                <div className="w-full h-full rounded-full border border-white/10 animate-[spin_30s_linear_infinite]">
                  {/* Particle 1 */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    <div className="w-3 h-3 bg-white/70 rounded-full shadow-[0_0_10px_3px_rgba(255,255,255,0.3)]"></div>
                  </div>
                  {/* Particle 2 */}
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2">
                    <div className="w-2 h-2 bg-white/60 rounded-full shadow-[0_0_8px_2px_rgba(255,255,255,0.25)]"></div>
                  </div>
                </div>
              </div>

              {/* Orbit Ring 2 - Middle (Counter-clockwise) */}
              <div className="absolute inset-[-15px] md:inset-[-22px]">
                <div className="w-full h-full rounded-full border border-white/5 animate-[spin_25s_linear_infinite_reverse]">
                  {/* Particle 3 */}
                  <div className="absolute top-1/2 right-0 translate-x-1/2 -translate-y-1/2">
                    <div className="w-2.5 h-2.5 bg-gradient-to-br from-white/70 to-light-grey rounded-full shadow-[0_0_8px_3px_rgba(255,255,255,0.3)]"></div>
                  </div>
                  {/* Particle 4 */}
                  <div className="absolute top-1/2 left-0 -translate-x-1/2 -translate-y-1/2">
                    <div className="w-1.5 h-1.5 bg-white/50 rounded-full shadow-[0_0_6px_2px_rgba(255,255,255,0.2)]"></div>
                  </div>
                </div>
              </div>

              {/* Orbit Ring 3 - Inner Fast */}
              <div className="absolute inset-[-2px] md:inset-[-5px]">
                <div className="w-full h-full rounded-full animate-[spin_15s_linear_infinite]">
                  {/* Particle 5 */}
                  <div className="absolute top-0 right-1/4">
                    <div className="w-2 h-2 bg-white/60 rounded-full shadow-[0_0_8px_2px_rgba(255,255,255,0.4)]"></div>
                  </div>
                </div>
              </div>

              {/* Logo */}
              <div className="relative z-10">
                <img
                  src="/images/LOGO.png"
                  alt="Logo"
                  className="w-28 h-28 md:w-36 md:h-36 object-contain"
                />
              </div>

            </div>
          </div>

          <div className="flex-1 text-center md:text-left md:pl-6 lg:pl-10">
            <div className="inline-block mb-8 perspective-1000 group cursor-default">
              <div className="relative px-6 py-2.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md overflow-hidden transition-all duration-500 hover:border-white/40 hover:shadow-[0_0_30px_-5px_rgba(255,255,255,0.3)] hover:scale-105">
                
                {/* Shimmer Background Animation */}
                <div 
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full"
                  style={{
                    animation: 'shimmer 5s linear infinite'
                  }}
                ></div>
                
                <div className="flex items-center gap-3 relative z-10">
                  {/* Dot */}
                  <div className="relative flex h-2.5 w-2.5">
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-gradient-to-br from-white to-light-grey shadow-lg"></span>
                  </div>

                  {/* Separator */}
                  <div className="h-4 w-[1px] bg-white/20"></div>

                  {/* Text with Gradient */}
                  <span className="text-sm font-bold tracking-[0.15em] text-transparent bg-clip-text bg-gradient-to-r from-white via-lightest-grey to-light-grey uppercase drop-shadow-sm">
                    Universitas Negeri Semarang
                  </span>
                </div>
              </div>
            </div>

            <VariableFontCursor 
              label="AES S-box Research Analyzer" 
              className="text-4xl md:text-5xl lg:text-6xl mb-6 leading-tight text-white"
              weightRange={[400, 800]}
              widthRange={[100, 130]}
              distRange={[0, 150]}
              spreadRange={[0, 5]}
            />

            <p className="font-body text-lg md:text-xl text-text-primary mb-8 max-w-3xl">
              Comprehensive Research Platform for AES S-box Modification through Affine Matrices Exploration and Parameter Optimization
            </p>

            <div className="flex flex-wrap gap-4 justify-center md:justify-start">
              <FeatureBadge text="GF(2⁸) Arithmetic" delay={0.1} />
              <FeatureBadge text="Matrix Exploration" delay={0.2} />
              <FeatureBadge text="Parameter Tweaking" delay={0.3} />
              <FeatureBadge text="Cryptanalysis Testing" delay={0.4} />
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-12"></svg>
      </div>
    </div>
  );
};

export default Hero;

