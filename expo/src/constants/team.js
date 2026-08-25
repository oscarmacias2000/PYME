// Equipo de BuildWise Labs. Datos placeholder: sustituye nombres, roles y fotos
// por los reales del equipo.
const P = (id) =>
  `https://images.unsplash.com/photo-${id}?w=400&q=80&auto=format&fit=crop`;

export const TEAM = [
  {
    id: 't1',
    name: 'Oscar Macias',
    role: 'Fundador & CTO',
    photo: P('1500648767791-00dcc994a43e'),
  },
  {
    id: 't2',
    name: 'Ana Torres',
    role: 'Automatizacion & IA',
    photo: P('1494790108377-be9c29b29330'),
  },
  {
    id: 't3',
    name: 'Luis Ramirez',
    role: 'Seguridad & Redes',
    photo: P('1507003211169-0a1dd7228f2d'),
  },
  {
    id: 't4',
    name: 'Marta Nunez',
    role: 'Diseno & Experiencia',
    photo: P('1438761681033-6461ffad8d80'),
  },
  {
    // Nuevo integrante. Reemplaza la foto: pon tu imagen en
    // assets/team/integrante1.jpg (mismo nombre) y actualiza name/role.
    id: 't5',
    name: 'Nuevo Integrante',
    role: 'Equipo',
    photo: require('../../assets/team/integrante1.jpg'),
  },
];

export const ABOUT = {
  intro:
    'BuildWise Labs es un equipo de tecnologia que disena sistemas inteligentes para automatizar operaciones y hacer crecer negocios con IA y tecnologia.',
  mission:
    'Nuestra mision es que cualquier empresa pueda hacer mas con menos trabajo manual, operando con las mismas herramientas y eficiencia que las grandes corporaciones.',
  values: [
    { id: 'v1', icon: 'flash-outline', title: 'Eficiencia', text: 'Automatizamos lo repetitivo para que tu equipo se enfoque en lo importante.' },
    { id: 'v2', icon: 'lock-closed-outline', title: 'Seguridad', text: 'Protegemos tu infraestructura con buenas practicas y auditorias.' },
    { id: 'v3', icon: 'people-outline', title: 'Cercania', text: 'Acompanamos cada proyecto de principio a fin, con soporte real.' },
  ],
};
