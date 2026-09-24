import { BooksController } from "./Books.controller";

const createRepositoryStub = (books = [], privateBooks = []) => ({
  getBooks: jest.fn(async () => books),
  getPrivateBooks: jest.fn(async () => privateBooks),
  addBook: jest.fn(async () => true)
});

const createStoreStub = () => ({
  refreshPrivateCount: jest.fn(async () => {})
});

const createController = (repository, store = createStoreStub()) =>
  new BooksController(repository, store);

describe("BooksController", () => {
  describe("private books counter", () => {
    it("refreshes the counter after a book is added", async () => {
      const store = createStoreStub();
      const controller = createController(createRepositoryStub(), store);
      controller.setName("Dune");
      controller.setAuthor("Herbert");

      await controller.addBook();

      expect(store.refreshPrivateCount).toHaveBeenCalledTimes(1);
    });

    it("does not refresh the counter when the book was not added", async () => {
      const store = createStoreStub();
      const repository = createRepositoryStub();
      repository.addBook.mockResolvedValue(false);
      const controller = createController(repository, store);
      controller.setName("Dune");
      controller.setAuthor("Herbert");

      await controller.addBook();

      expect(store.refreshPrivateCount).not.toHaveBeenCalled();
    });
  });

  describe("outdated responses", () => {
    it("ignores a slow response of a previous mode", async () => {
      const repository = createRepositoryStub(
        [],
        [{ author: "Herbert", name: "Dune" }]
      );
      let resolveAllBooks;
      repository.getBooks.mockImplementation(
        () => new Promise((resolve) => (resolveAllBooks = resolve))
      );
      const controller = createController(repository);

      const loadingAll = controller.load();
      await controller.setMode("private");
      resolveAllBooks([{ author: "Tolkien", name: "The Hobbit" }]);
      await loadingAll;

      expect(controller.bookLines).toEqual(["Herbert: Dune"]);
    });

    it("stays loading until the response of the current mode arrives", async () => {
      const repository = createRepositoryStub();
      let resolveAllBooks;
      let resolvePrivateBooks;
      repository.getBooks.mockImplementation(
        () => new Promise((resolve) => (resolveAllBooks = resolve))
      );
      repository.getPrivateBooks.mockImplementation(
        () => new Promise((resolve) => (resolvePrivateBooks = resolve))
      );
      const controller = createController(repository);

      const loadingAll = controller.load();
      const switching = controller.setMode("private");
      resolveAllBooks([]);
      await loadingAll;
      expect(controller.isLoading).toBe(true);

      resolvePrivateBooks([]);
      await switching;
      expect(controller.isLoading).toBe(false);
    });
  });

  describe("actions for the view", () => {
    it("shows private books via showPrivate and all books via showAll", async () => {
      const repository = createRepositoryStub(
        [{ author: "Tolkien", name: "The Hobbit" }],
        [{ author: "Herbert", name: "Dune" }]
      );
      const controller = createController(repository);

      await controller.showPrivate();
      expect(controller.bookLines).toEqual(["Herbert: Dune"]);

      await controller.showAll();
      expect(controller.bookLines).toEqual(["Tolkien: The Hobbit"]);
    });

    it("fills the form from input events", () => {
      const controller = createController(createRepositoryStub());

      controller.onNameChange({ target: { value: "Dune" } });
      controller.onAuthorChange({ target: { value: "Herbert" } });

      expect(controller.name).toBe("Dune");
      expect(controller.author).toBe("Herbert");
    });

    it("disables the add button until both fields are filled", () => {
      const controller = createController(createRepositoryStub());
      expect(controller.isAddDisabled).toBe(true);

      controller.setName("Dune");
      expect(controller.isAddDisabled).toBe(true);

      controller.setAuthor("Herbert");
      expect(controller.isAddDisabled).toBe(false);
    });
  });

  describe("mode switch", () => {
    it("shows all books by default", () => {
      const controller = createController(createRepositoryStub());

      expect(controller.isAllMode).toBe(true);
      expect(controller.isPrivateMode).toBe(false);
    });

    it("loads all books, not private ones, in the default mode", async () => {
      const repository = createRepositoryStub();
      const controller = createController(repository);

      await controller.load();

      expect(repository.getBooks).toHaveBeenCalledTimes(1);
      expect(repository.getPrivateBooks).not.toHaveBeenCalled();
    });

    it("loads and shows private books after switching to the private mode", async () => {
      const repository = createRepositoryStub(
        [{ author: "Tolkien", name: "The Hobbit" }],
        [{ author: "Herbert", name: "Dune" }]
      );
      const controller = createController(repository);

      await controller.setMode("private");

      expect(controller.isPrivateMode).toBe(true);
      expect(controller.isAllMode).toBe(false);
      expect(controller.bookLines).toEqual(["Herbert: Dune"]);
    });

    it("shows all books again after switching back", async () => {
      const repository = createRepositoryStub(
        [{ author: "Tolkien", name: "The Hobbit" }],
        [{ author: "Herbert", name: "Dune" }]
      );
      const controller = createController(repository);
      await controller.setMode("private");

      await controller.setMode("all");

      expect(controller.bookLines).toEqual(["Tolkien: The Hobbit"]);
    });

    it("reloads the private list after adding a book in the private mode", async () => {
      const repository = createRepositoryStub();
      const controller = createController(repository);
      await controller.setMode("private");
      repository.getPrivateBooks.mockClear();
      controller.setName("Dune");
      controller.setAuthor("Herbert");

      await controller.addBook();

      expect(repository.getPrivateBooks).toHaveBeenCalledTimes(1);
      expect(repository.getBooks).not.toHaveBeenCalled();
    });
  });

  it("starts with an empty list", () => {
    const controller = createController(createRepositoryStub());

    expect(controller.bookLines).toEqual([]);
    expect(controller.isLoading).toBe(false);
  });

  it("loads books and shows them as 'author: name' lines", async () => {
    const repository = createRepositoryStub([
      { author: "Tolkien", name: "The Hobbit" },
      { author: "Asimov", name: "I, Robot" }
    ]);
    const controller = createController(repository);

    await controller.load();

    expect(controller.bookLines).toEqual([
      "Tolkien: The Hobbit",
      "Asimov: I, Robot"
    ]);
  });

  it("is loading while the books are being fetched", async () => {
    const controller = createController(createRepositoryStub());

    const loading = controller.load();
    expect(controller.isLoading).toBe(true);

    await loading;
    expect(controller.isLoading).toBe(false);
  });

  it("adds a book from the form fields and reloads the list", async () => {
    const repository = createRepositoryStub();
    const controller = createController(repository);
    controller.setName("Dune");
    controller.setAuthor("Herbert");

    await controller.addBook();

    expect(repository.addBook).toHaveBeenCalledWith({
      name: "Dune",
      author: "Herbert"
    });
    expect(repository.getBooks).toHaveBeenCalledTimes(1);
  });

  it("clears the form after the book is added", async () => {
    const controller = createController(createRepositoryStub());
    controller.setName("Dune");
    controller.setAuthor("Herbert");

    await controller.addBook();

    expect(controller.name).toBe("");
    expect(controller.author).toBe("");
  });

  it("does not add a book when the name or author is empty", async () => {
    const repository = createRepositoryStub();
    const controller = createController(repository);
    controller.setName("Dune");

    await controller.addBook();

    expect(repository.addBook).not.toHaveBeenCalled();
  });

  it("keeps the form filled when the book was not added", async () => {
    const repository = createRepositoryStub();
    repository.addBook.mockResolvedValue(false);
    const controller = createController(repository);
    controller.setName("Dune");
    controller.setAuthor("Herbert");

    await controller.addBook();

    expect(controller.name).toBe("Dune");
    expect(repository.getBooks).not.toHaveBeenCalled();
  });
});
