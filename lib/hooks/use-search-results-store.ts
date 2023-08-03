import { Data } from 'pages/search';
import { create } from 'zustand';

interface SearchResultsState {
  query: string;
  setQuery: (query: string) => void;
  searchResults: Data | null;
  setSearchResults: (searchResults: Data) => void;
}

export const useSearchResultsStore = create<SearchResultsState>()((set) => ({
  query: '',
  setQuery: (userQuery: string) => set({ query: userQuery }),
  searchResults: null,
  setSearchResults: (newSearchResults: Data) =>
    set({ searchResults: newSearchResults })
}));
