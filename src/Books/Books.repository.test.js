import booksRepository from "./Books.repository";

const createGatewayStub = ({ get = [], post = { status: "ok" } } = {}) => ({
  get: jest.fn(async () => get),
  post: jest.fn(async () => post)
});

describe("BooksRepository", () => {
  it("gets all books from the root of the user's collection", async () => {
    const gateway = createGatewayStub({ get: [{ name: "Dune" }] });
    booksRepository.httpGateway = gateway;

    const books = await booksRepository.getBooks();

    expect(gateway.get).toHaveBeenCalledWith("/");
    expect(books).toEqual([{ name: "Dune" }]);
  });

  it("gets private books from the private endpoint", async () => {
    const gateway = createGatewayStub({ get: [{ name: "Dune" }] });
    booksRepository.httpGateway = gateway;

    const books = await booksRepository.getPrivateBooks();

    expect(gateway.get).toHaveBeenCalledWith("/private");
    expect(books).toEqual([{ name: "Dune" }]);
  });

  it("posts a new book to the root of the user's collection", async () => {
    const gateway = createGatewayStub();
    booksRepository.httpGateway = gateway;

    await booksRepository.addBook({ name: "Dune", author: "Herbert" });

    expect(gateway.post).toHaveBeenCalledWith("/", {
      name: "Dune",
      author: "Herbert"
    });
  });

  it("reports success when the API answers ok", async () => {
    booksRepository.httpGateway = createGatewayStub({ post: { status: "ok" } });

    expect(await booksRepository.addBook({ name: "a", author: "b" })).toBe(true);
  });

  it("reports failure when the API does not answer ok", async () => {
    booksRepository.httpGateway = createGatewayStub({ post: { status: "error" } });

    expect(await booksRepository.addBook({ name: "a", author: "b" })).toBe(false);
  });

  it("reports failure when the API answers with nothing", async () => {
    booksRepository.httpGateway = createGatewayStub({ post: null });

    expect(await booksRepository.addBook({ name: "a", author: "b" })).toBe(false);
  });
});
