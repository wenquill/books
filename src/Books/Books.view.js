import React from "react";
import { observer } from "mobx-react";

import { useController } from "../Shared/useController";
import { BooksController } from "./Books.controller";

export const BooksView = observer(() => {
  const controller = useController(() => new BooksController());

  return (
    <div>
      <button disabled={controller.isAllMode} onClick={controller.showAll}>
        All books
      </button>
      <button
        disabled={controller.isPrivateMode}
        onClick={controller.showPrivate}
      >
        Private books
      </button>
      {controller.bookLines.map((line, i) => (
        <div key={i}>{line}</div>
      ))}
      <input
        placeholder="Name"
        value={controller.name}
        onChange={controller.onNameChange}
      />
      <input
        placeholder="Author"
        value={controller.author}
        onChange={controller.onAuthorChange}
      />
      <button disabled={controller.isAddDisabled} onClick={controller.addBook}>
        Add
      </button>
    </div>
  );
});
