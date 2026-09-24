import { BooksController } from "./Books.controller";

const createRepositoryStub = (books = [], privateBooks = []) => ({
  getBooks: jest.fn(async () => books),
  getPrivateBooks: jest.fn(async () => privateBooks),
  addBook: jest.fn(async () => true)
});

describe("BooksController", () => {
  describe("mode switch", () => {
    it("shows all books by default", () => {
      const controller = new BooksController(createRepositoryStub());

      expect(controller.isAllMode).toBe(true);
      expect(controller.isPrivateMode).toBe(false);
    });

    it("loads all books, not private ones, in the default mode", async () => {
      const repository = createRepositoryStub();
      const controller = new BooksController(repository);

      await controller.load();

      expect(repository.getBooks).toHaveBeenCalledTimes(1);
      expect(repository.getPrivateBooks).not.toHaveBeenCalled();
    });

    it("loads and shows private books after switching to the private mode", async () => {
      const repository = createRepositoryStub(
        [{ author: "Tolkien", name: "The Hobbit" }],
        [{ author: "Herbert", name: "Dune" }]
      );
      const controller = new BooksController(repository);

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
      const controller = new BooksController(repository);
      await controller.setMode("private");

      await controller.setMode("all");

      expect(controller.bookLines).toEqual(["Tolkien: The Hobbit"]);
    });

    it("reloads the private list after adding a book in the private mode", async () => {
      const repository = createRepositoryStub();
      const controller = new BooksController(repository);
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
    const controller = new BooksController(createRepositoryStub());

    expect(controller.bookLines).toEqual([]);
    expect(controller.isLoading).toBe(false);
  });

  it("loads books and shows them as 'author: name' lines", async () => {
    const repository = createRepositoryStub([
      { author: "Tolkien", name: "The Hobbit" },
      { author: "Asimov", name: "I, Robot" }
    ]);
    const controller = new BooksController(repository);

    await controller.load();

    expect(controller.bookLines).toEqual([
      "Tolkien: The Hobbit",
      "Asimov: I, Robot"
    ]);
  });

  it("is loading while the books are being fetched", async () => {
    const controller = new BooksController(createRepositoryStub());

    const loading = controller.load();
    expect(controller.isLoading).toBe(true);

    await loading;
    expect(controller.isLoading).toBe(false);
  });

  it("adds a book from the form fields and reloads the list", async () => {
    const repository = createRepositoryStub();
    const controller = new BooksController(repository);
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
    const controller = new BooksController(createRepositoryStub());
    controller.setName("Dune");
    controller.setAuthor("Herbert");

    await controller.addBook();

    expect(controller.name).toBe("");
    expect(controller.author).toBe("");
  });

  it("does not add a book when the name or author is empty", async () => {
    const repository = createRepositoryStub();
    const controller = new BooksController(repository);
    controller.setName("Dune");

    await controller.addBook();

    expect(repository.addBook).not.toHaveBeenCalled();
  });

  it("keeps the form filled when the book was not added", async () => {
    const repository = createRepositoryStub();
    repository.addBook.mockResolvedValue(false);
    const controller = new BooksController(repository);
    controller.setName("Dune");
    controller.setAuthor("Herbert");

    await controller.addBook();

    expect(controller.name).toBe("Dune");
    expect(repository.getBooks).not.toHaveBeenCalled();
  });
});
