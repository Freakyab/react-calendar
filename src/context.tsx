import React, { createContext, useContext, useState } from "react";

// Location Context
type Options = {
  isModelOpen: boolean;
  selectedDate: Date;
  isEventDetails: boolean;
  isEditable : boolean;
  searchQuery : string;
};

export const ModelControlContext = createContext({
  controlOption: {
    isModelOpen: false,
    selectedDate: new Date(),
    isEventDetails: false,
    isEditable : false,
    searchQuery : "",
  },
  setControlOption: (option: Options) => {},
});

export const ModelControlProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [controlOption, setControlOption] = useState<Options>({
    isModelOpen: false,
    selectedDate: new Date(),
    isEventDetails : false,
    isEditable : false,
    searchQuery : "",
  });
  return (
    <ModelControlContext.Provider value={{ controlOption, setControlOption }}>
      {children}
    </ModelControlContext.Provider>
  );
};

export const useModelOption = () => useContext(ModelControlContext);
