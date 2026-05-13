const WORDS = [
  'lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit',
  'sed', 'do', 'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore',
  'magna', 'aliqua', 'enim', 'ad', 'minim', 'veniam', 'quis', 'nostrud',
  'exercitation', 'ullamco', 'laboris', 'nisi', 'aliquip', 'ex', 'ea', 'commodo',
  'consequat', 'duis', 'aute', 'irure', 'in', 'reprehenderit', 'voluptate',
  'velit', 'esse', 'cillum', 'fugiat', 'nulla', 'pariatur', 'excepteur', 'sint',
  'occaecat', 'cupidatat', 'non', 'proident', 'sunt', 'culpa', 'qui', 'officia',
  'deserunt', 'mollit', 'anim', 'id', 'est', 'laborum', 'perspiciatis', 'unde',
  'omnis', 'iste', 'natus', 'error', 'voluptatem', 'accusantium', 'doloremque',
  'laudantium', 'totam', 'rem', 'aperiam', 'eaque', 'ipsa', 'quae', 'ab', 'illo',
  'inventore', 'veritatis', 'quasi', 'architecto', 'beatae', 'vitae', 'dicta',
  'explicabo', 'nemo', 'ipsam', 'quia', 'voluptas', 'aspernatur', 'aut', 'odit',
  'fugit', 'consequuntur', 'magni', 'dolores', 'ratione', 'nesciunt', 'neque',
  'porro', 'quisquam', 'nihil', 'molestiae', 'illum', 'corporis', 'suscipit',
  'laboriosam', 'harum', 'quidem', 'rerum', 'facilis', 'distinctio',
];

function pick(): string {
  return WORDS[Math.floor(Math.random() * WORDS.length)]!;
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function generateWords(count: number): string {
  return Array.from({ length: count }, () => pick()).join(' ');
}

export function generateSentences(count: number): string {
  return Array.from({ length: count }, () => {
    const len = 8 + Math.floor(Math.random() * 12);
    const words = Array.from({ length: len }, () => pick());
    words[0] = capitalize(words[0]!);
    return words.join(' ') + '.';
  }).join(' ');
}

export function generateParagraphs(count: number): string {
  return Array.from({ length: count }, () => {
    const sentences = 3 + Math.floor(Math.random() * 5);
    return generateSentences(sentences);
  }).join('\n\n');
}
