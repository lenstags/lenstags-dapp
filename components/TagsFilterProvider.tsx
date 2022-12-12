import { createContext, Dispatch, SetStateAction, useState } from "react";

export const TagsFilterContext = createContext<{
  tags: string[];
  setTags: Dispatch<SetStateAction<string[]>>;
}>({ tags: [], setTags: () => {} });

export default function TagsFilterProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [tags, setTags] = useState<string[]>([]);

  return (
    <TagsFilterContext.Provider value={{ tags, setTags }}>
      {children}
    </TagsFilterContext.Provider>
  );
}
