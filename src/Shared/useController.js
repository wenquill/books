import { useEffect, useState } from "react";

export const useController = (createController) => {
  const [controller] = useState(createController);

  useEffect(() => {
    controller.load();
  }, [controller]);

  return controller;
};
