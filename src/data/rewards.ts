export interface BadgeDefinition {
  id: string;
  name: string;
  emoji: string;
  description: string;
}

export const BADGE_DEFINITIONS: BadgeDefinition[] = [
  {
    id: 'badge-debutant',
    name: 'Esprit Curieux',
    emoji: '⚡',
    description: 'Tu as commencé ton parcours interactif !',
  },
  {
    id: 'badge-premiere-lecon',
    name: 'Premier Déclic',
    emoji: '💡',
    description: 'Tu as terminé ta première notion complète.',
  },
  {
    id: 'badge-sans-faute',
    name: 'Logique Parfaite',
    emoji: '🌟',
    description: '100 % de réussite sur une leçon complète.',
  },
  {
    id: 'badge-geometre',
    name: 'Maître des Formes',
    emoji: '📐',
    description: 'Tu as exploré la géométrie interactive.',
  },
  {
    id: 'badge-explorateur',
    name: 'Champion des Notions',
    emoji: '🏆',
    description: 'Au moins 5 notions maîtrisées dans le parcours !',
  },
];
