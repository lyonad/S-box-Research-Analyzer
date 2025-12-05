/**
 * Research Team Section Component
 * Enhanced with amazing card effects
 */

import React, { useRef } from 'react';

interface TeamMember {
  name: string;
  role: string;
  image: string;
}

const teamMembers: TeamMember[] = [
  {
    name: 'Riski Yuniar Pratama',
    role: 'Master Cryptographer | 2304130134',
    image: '/images/Person 1.jpg',
  },
  {
    name: 'Naufal Tipasha Denyana',
    role: 'Expert Cryptographer | 2304130115',
    image: '/images/Person 2.jpg',
  },
  {
    name: 'Lyon Ambrosio Djuanda',
    role: 'Super Cryptographer | 2304130098',
    image: '/images/Person 3.jpg',
  },
  {
    name: 'Gangsar Reka Pambudi',
    role: 'Senior Cryptographer | 2304130130',
    image: '/images/Person 4.jpg',
  },
];

const TeamCard: React.FC<{ member: TeamMember }> = ({ member }) => {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = (y - centerY) / 10;
    const rotateY = (centerX - x) / 10;

    cardRef.current.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(20px)`;
  };

  const handleMouseLeave = () => {
    if (!cardRef.current) return;
    cardRef.current.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px)';
  };

  return (
    <div
      ref={cardRef}
      className="group relative overflow-hidden rounded-2xl cursor-pointer transition-all duration-500 ease-out"
      style={{
        transformStyle: 'preserve-3d',
        transition: 'transform 0.3s ease-out',
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Animated Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-white/20 to-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"></div>

      {/* Image Container with Overlay */}
      <div className="aspect-square overflow-hidden bg-surface-light relative rounded-t-2xl">
        <img
          src={member.image}
          alt={member.name}
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI0E4QTdBNyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjE4IiBmaWxsPSIjNDc0NzQ3IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+Tm8gSW1hZ2U8L3RleHQ+PC9zdmc+';
          }}
        />

        {/* Animated Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-t-2xl"></div>

        {/* Shine Effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out rounded-t-2xl"></div>
      </div>

      {/* Researcher Description - Enhanced */}
      <div className="relative p-6 text-center bg-surface-darkest/95 backdrop-blur-sm rounded-b-2xl">
        {/* Animated Border */}
        <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-white via-white to-white transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>

        <h3 className="font-subheading text-lg md:text-xl text-white mb-2 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
          {member.name}
        </h3>
        <p className="font-body text-sm text-white/80 font-semibold transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300 delay-75">
          {member.role}
        </p>

        {/* Hover Indicator */}
        <div className="mt-4 flex justify-center">
          <div className="w-8 h-0.5 bg-gradient-to-r from-white to-white rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 delay-150"></div>
        </div>
      </div>

    </div>
  );
};

const TeamSection: React.FC = () => {
  return (
    <section className="py-16 bg-surface-darkest relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-transparent"></div>
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_20%,rgba(153,153,153,0.1),transparent_50%)]"></div>
      <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_70%_80%,rgba(204,204,204,0.1),transparent_50%)]"></div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <h2 className="font-subheading text-4xl md:text-5xl text-white mb-6 animate-fade-in">
            Research Team
          </h2>
          <div className="w-16 h-[2px] bg-white/60 mx-auto mb-6 animate-scale-in"></div>
          <p className="font-body text-xl text-text-primary mx-auto animate-fade-in-up whitespace-nowrap">Dedicated researchers working on advanced cryptographic systems and S-box optimization</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {teamMembers.map((member, index) => (
            <div
              key={index}
              className="animate-fade-in-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <TeamCard member={member} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TeamSection;
