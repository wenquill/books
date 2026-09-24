import { PrivateBooksStore } from "./PrivateBooks.store";

const createRepositoryStub = (privateBooks = []) => ({
  getPrivateBooks: jest.fn(async () => privateBooks)
});

describe("PrivateBooksStore", () => {
  it("starts with zero private books", () => {
    const store = new PrivateBooksStore(createRepositoryStub());

    expect(store.privateCount).toBe(0);
  });

  it("counts private books after refresh", async () => {
    const store = new PrivateBooksStore(
      createRepositoryStub([{ name: "Dune" }, { name: "Emma" }])
    );

    await store.refreshPrivateCount();

    expect(store.privateCount).toBe(2);
  });

  it("picks up new books on the next refresh", async () => {
    const repository = createRepositoryStub([{ name: "Dune" }]);
    const store = new PrivateBooksStore(repository);
    await store.refreshPrivateCount();

    repository.getPrivateBooks.mockResolvedValue([{ name: "Dune" }, { name: "Emma" }]);
    await store.refreshPrivateCount();

    expect(store.privateCount).toBe(2);
  });
});
