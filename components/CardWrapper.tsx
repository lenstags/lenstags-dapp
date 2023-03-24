import { useEffect, useState } from 'react';

import dynamic from 'next/dynamic';

interface CardProps {
  id: string;
  title: string;
  content: string;
}

function Card({ id, title, content }: CardProps) {
  return (
    <div>
      <h2>{title}</h2>
      <p>{content}</p>
    </div>
  );
}

function CardSkeleton() {
  return (
    <div>
      <h1>Loading...</h1>
    </div>
  );
}

function CardWrapper({ children }: { children: React.ReactNode }) {
  const [showCards, setShowCards] = useState(false);

  const handleScroll = () => {
    const element = document.getElementById('card-wrapper');
    const scrollTop = element?.scrollTop || 0;
    const scrollHeight = element?.scrollHeight || 0;
    const clientHeight = element?.clientHeight || 0;
    const isBottom = scrollTop + clientHeight === scrollHeight;

    if (isBottom) {
      setShowCards(true);
    }
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div id="card-wrapper" style={{ position: 'relative' }}>
      {showCards ? children : <CardSkeleton />}
    </div>
  );
}

interface CardListProps {
  cards: CardProps[];
}

export default function CardList({ cards }: CardListProps) {
  const DynamicCard = dynamic(() => import('./ExplorerCard'));

  return (
    <CardWrapper>
      {cards.map((card) => (
        <DynamicCard key={card.id} {...card} />
      ))}
    </CardWrapper>
  );
}
