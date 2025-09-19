import { createContext, Dispatch, ReactNode, SetStateAction, useContext, useState } from "react";
import { RelatedWork } from "@/app/types";
import { DEMO_WORKS } from "@/providers/demoWorks";

interface RelatedWorksContextType {
  works: RelatedWork[];
  setWorks: Dispatch<SetStateAction<RelatedWork[]>>;
}

const RelatedWorksContext = createContext<RelatedWorksContextType | null>(null);

export function RelatedWorksProvider({ children }: { children: ReactNode }) {
  const [works, setWorks] = useState<RelatedWork[]>(DEMO_WORKS);

  return <RelatedWorksContext.Provider value={{ works, setWorks }}>{children}</RelatedWorksContext.Provider>;
}

export function useRelatedWorksContext() {
  const context = useContext(RelatedWorksContext);
  if (!context) {
    throw new Error("useRelatedWorksContext must be used within a RelatedWorksProvider");
  }
  return context;
}
