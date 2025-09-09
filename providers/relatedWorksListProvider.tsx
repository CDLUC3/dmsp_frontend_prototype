import { createContext, ReactNode, useContext, useState } from "react";
import { Confidence, RelatedWorksSortBy } from "@/app/types";

interface RelatedWorksListContextType {
  confidence: string;
  setConfidence: (value: string) => void;
  type: string | null;
  setType: (value: string | null) => void;
  highlightMatches: boolean;
  setHighlightMatches: (value: boolean) => void;
  page: number;
  setPage: (value: number) => void;
  sortBy: string | null;
  setSortBy: (value: string | null) => void;
}

const RelatedWorksListContext = createContext<RelatedWorksListContextType | null>(null);

interface RelatedWorksListProviderProps {
  children: ReactNode;
  defaultConfidence?: string;
  defaultType?: string | null;
  defaultHighlightMatches?: boolean;
  defaultPage?: number;
  defaultSortBy?: string | null;
}

export function RelatedWorksListProvider({
  children,
  defaultConfidence = Confidence.All,
  defaultType = null,
  defaultHighlightMatches = false,
  defaultPage = 1,
  defaultSortBy = RelatedWorksSortBy.ConfidenceHigh,
}: RelatedWorksListProviderProps) {
  const [confidence, setConfidence] = useState<string>(defaultConfidence);
  const [type, setType] = useState<string | null>(defaultType);
  const [highlightMatches, setHighlightMatches] = useState<boolean>(defaultHighlightMatches);
  const [page, setPage] = useState<number>(defaultPage);
  const [sortBy, setSortBy] = useState<string | null>(defaultSortBy);

  return (
    <RelatedWorksListContext.Provider
      value={{
        confidence,
        setConfidence,
        type,
        setType,
        highlightMatches,
        setHighlightMatches,
        page,
        setPage,
        sortBy,
        setSortBy,
      }}
    >
      {children}
    </RelatedWorksListContext.Provider>
  );
}

export function useRelatedWorksListContext() {
  const context = useContext(RelatedWorksListContext);
  if (!context) {
    throw new Error("useRelatedWorksListContext must be used within a RelatedWorksListProvider");
  }
  return context;
}
