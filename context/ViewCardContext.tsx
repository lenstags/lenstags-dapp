import {
  getFromLocalStorage,
  setLensLocalStorage
} from '@lib/lens/localStorage';
import React, { createContext, useState, useEffect } from 'react';
export const ViewBy = {
  LIST: 'list',
  CARD: 'card',
  POST: 'post'
};

export type ViewCardProps = {
  viewCard: typeof ViewBy.LIST | typeof ViewBy.POST | typeof ViewBy.CARD;
  setViewCard: React.Dispatch<
    React.SetStateAction<
      typeof ViewBy.LIST | typeof ViewBy.POST | typeof ViewBy.CARD
    >
  >;
};

export type ViewCardContext = ViewCardProps;

export const ViewCardContext = createContext<ViewCardContext>({
  viewCard: ViewBy.LIST,
  setViewCard: () => {}
});

export const ViewCardContextProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [viewCard, setViewCard] = useState<ViewCardProps['viewCard']>(
    ViewBy.CARD
  );

  useEffect(() => {
    const lensStorage = getFromLocalStorage();
    if (lensStorage) {
      setLensLocalStorage({
        ...lensStorage,
        cardView: viewCard
      });
    }
    if (lensStorage && lensStorage.cardView) {
      setViewCard(lensStorage.cardView);
    }
  }, [viewCard]);

  return (
    <ViewCardContext.Provider value={{ viewCard, setViewCard }}>
      {children}
    </ViewCardContext.Provider>
  );
};
