import React from "react";
import { observer } from "mobx-react";

import { useController } from "../Shared/useController";
import { BooksController } from "./Books.controller";

export const BooksView = observer(() => {
  const controller = useController(() => new BooksController());

  return (
    <div>
      <button
        disabled={controller.isAllMode}
        onClick={() => controller.setMode("all")}
      >
        All books
      </button>
      <button
        disabled={controller.isPrivateMode}
        onClick={() => controller.setMode("private")}
      >
        Private books
      </button>
      {controller.bookLines.map((line, i) => (
        <div key={i}>{line}</div>
      ))}
      <input
        placeholder="Name"
        value={controller.name}
        onChange={(e) => controller.setName(e.target.value)}
      />
      <input
        placeholder="Author"
        value={controller.author}
        onChange={(e) => controller.setAuthor(e.target.value)}
      />
      <button disabled={!controller.canAdd} onClick={controller.addBook}>
        Add
      </button>
    </div>
  );
});
