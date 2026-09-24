import React, { useEffect, useState } from "react";
import { observer } from "mobx-react";

import { BooksController } from "./Books.controller";

export const BooksView = observer(() => {
  const [controller] = useState(() => new BooksController());

  useEffect(() => {
    controller.load();
  }, [controller]);

  return (
    <div>
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
