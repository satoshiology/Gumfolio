import * as React from "react";

interface DeveloperContextType {
  isDevMode: boolean;
  setDevMode: (val: boolean) => void;
  isMockData: boolean;
  setMockData: (val: boolean) => void;
}

const DeveloperContext = React.createContext<DeveloperContextType>({
  isDevMode: false,
  setDevMode: () => {},
  isMockData: false,
  setMockData: () => {},
});

export const DeveloperProvider = ({ children }: { children: React.ReactNode }) => {
  const [isDevMode, setDevMode] = React.useState(false);
  const [isMockData, setMockData] = React.useState(false);

  // Reset Mock Data when leaving Dev Mode
  React.useEffect(() => {
    if (!isDevMode) setMockData(false);
  }, [isDevMode]);

  return (
    <DeveloperContext.Provider value={{ isDevMode, setDevMode, isMockData, setMockData }}>
      {children}
    </DeveloperContext.Provider>
  );
};

export const useDeveloper = () => React.useContext(DeveloperContext);
