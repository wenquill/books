import { HeaderController } from "./Header.controller";

const createStoreStub = (privateCount = 0) => ({
  privateCount,
  refreshPrivateCount: jest.fn(async () => {})
});

describe("HeaderController", () => {
  it("shows the number of private books from the store", () => {
    const controller = new HeaderController(createStoreStub(30));

    expect(controller.counterText).toBe("Your books: 30");
  });

  it("asks the store to refresh the counter on load", async () => {
    const store = createStoreStub();
    const controller = new HeaderController(store);

    await controller.load();

    expect(store.refreshPrivateCount).toHaveBeenCalledTimes(1);
  });
});
