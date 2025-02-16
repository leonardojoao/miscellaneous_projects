import { createContext, useContext, useState } from 'react';

interface GlobalData {
  accessToken?: string;
}

interface GlobalContextProps {
  globalData: GlobalData;
  // setGlobalData: React.Dispatch<React.SetStateAction<GlobalData>>;
  setGlobalData: (globalData: GlobalData) => void;
}

// const GlobalContext = createContext<GlobalContextProps>({} as GlobalContextProps);
const GlobalContext = createContext({} as GlobalContextProps);

interface GlobalContextProviderProps {
  children: React.ReactNode;
}

// export const GlobalContextProvider: React.FC<GlobalContextProviderProps> = ({ children }) => {
export const GlobalContextProvider = ({ children }: GlobalContextProviderProps) => {
  const [globalData, setGlobalData] = useState<GlobalData>({});

  return (
    <GlobalContext.Provider value={{ globalData, setGlobalData }}>
      {children}
    </GlobalContext.Provider>
  );
};

export const useGlobalContext = () => {
  const { globalData, setGlobalData } = useContext(GlobalContext);

  const setAccessToken = (accessToken: string) => {
    setGlobalData({
      ...globalData,
      accessToken,
    });
  };

  return {
    accessToken: globalData?.accessToken,
    setAcessToken: setAccessToken,
  };
};
