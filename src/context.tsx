import React, { createContext, useContext, useState } from "react";

// Context to manage the model options
type Options = {
  // Boolean to check if the create model is open
  isModelOpen: boolean;

  // Selected date for the model to open
  selectedDate: Date;

  // Boolean to check if the model is for event details or update event details
  isEventDetails: boolean;

  // Boolean to check if the model data is editable
  isEditable : boolean;

  // Search query to filter events
  searchQuery : string;
};

export const ModelControlContext = createContext({
  // Default values for the context
  controlOption: {
    isModelOpen: false,
    selectedDate: new Date(),
    isEventDetails: false,
    isEditable : false,
    searchQuery : "",
  },
  // Function to set the model options
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
