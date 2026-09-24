import { BooksController } from "./Books.controller";

const createRepositoryStub = (books = []) => ({
  getBooks: jest.fn(async () => books),
  addBook: jest.fn(async () => true)
});

describe("BooksController", () => {
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
