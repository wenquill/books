import React from "react";
import { observer } from "mobx-react";

import { useController } from "../Shared/useController";
import { HeaderController } from "./Header.controller";

export const HeaderView = observer(() => {
  const controller = useController(() => new HeaderController());

  return <header className="header">{controller.counterText}</header>;
});
