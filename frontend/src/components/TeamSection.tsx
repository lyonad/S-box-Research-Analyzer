/**
 * Research Team Section Component
 */

import React from 'react';

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

const TeamSection: React.FC = () => {
  return (
    <section className="py-16 bg-neutral-darker">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-white mb-4">
            Research Team
          </h2>
          <div className="w-24 h-1 bg-gradient-primary mx-auto mb-4"></div>
          <p className="font-body text-lg text-primary-light max-w-2xl mx-auto">
            Dedicated researchers working on advanced cryptographic systems and S-box optimization
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {teamMembers.map((member, index) => (
            <div 
              key={index}
              className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
            >
              {/* Image Container */}
              <div className="aspect-square overflow-hidden bg-neutral-light relative">
                <img 
                  src={member.image} 
                  alt={member.name}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI0E4QTdBNyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjE4IiBmaWxsPSIjNDc0NzQ3IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+Tm8gSW1hZ2U8L3RleHQ+PC9zdmc+';
                  }}
                />
              </div>

              {/* Researcher Description - Below Photo */}
              <div className="p-4 text-center">
                <h3 className="font-heading text-base md:text-lg font-bold text-white mb-1">
                  {member.name}
                </h3>
                <p className="font-body text-xs text-accent-pink font-semibold">
                  {member.role}
                </p>
              </div>

              {/* Accent Border */}
              <div className="absolute inset-0 border-2 border-transparent group-hover:border-accent-pink transition-[border-color] duration-300 delay-150 group-hover:delay-0 rounded-2xl pointer-events-none"></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TeamSection;
