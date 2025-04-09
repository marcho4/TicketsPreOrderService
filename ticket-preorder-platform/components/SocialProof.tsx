import Image from "next/image";

const TEAMS = [
    { name: 'Зенит', color: '#0077C0', secondaryColor: '#FFFFFF', logo: '/zenit.svg' },
    { name: 'Спартак', color: '#E30613', secondaryColor: '#FFFFFF', logo: '/spartak.svg' },
    { name: 'ЦСКА', color: '#1A3C8B', secondaryColor: '#FF0000', logo: '/cska.svg' },
    { name: 'Локомотив', color: '#007C41', secondaryColor: '#E52B1E', logo: '/loko-cropped.svg' },
    { name: 'Краснодар', color: '#212121', secondaryColor: '#0A8F3C', logo: '/krasnodar-cropped.svg' },
    { name: 'Динамо', color: '#0033A0', secondaryColor: '#FFFFFF', logo: '/dynamo.svg' },
  ];

export default function SocialProof() {
    return (
        <div className='flex flex-col items-center justify-center mb-32'>
        <h2 className='text-3xl sm:text-4xl md:text-5xl text-gray-800 font-semibold text-center leading-tight mb-10'>Нас выбирают лучшие</h2>
        
        <div className="w-full overflow-hidden relative py-8 rounded-xl">
          <div className="flex w-full">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-8 w-full px-4 sm:px-8">
              {TEAMS.map((team, index) => (
                <div 
                  key={`team-${index}`} 
                  className="flex flex-col items-center justify-center group"
                >
                  <div className="relative h-48 flex items-center justify-center overflow-hidden rounded-xl p-4  transition-all duration-300 hover:scale-105">
                    <Image 
                      src={team.logo} 
                      alt={team.name} 
                      width={100} 
                      height={100}
                      className="object-contain" 
                    />
                  </div>
                  <span className="mt-3 font-medium text-gray-800 text-md sm:text-lg  group-hover:text-primary transition-colors duration-200">
                    {team.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    ) 
}