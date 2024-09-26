const {
  printLogEntriesAsync,
  buildHeapAsyncronouslyFromLogSources,
} = require("../solution/async-sorted-merge");

describe("buildHeapAsyncronouslyFromLogSources", () => {
  test("It should create an empty heap if no log sources exist", async () => {
    const asyncLogSources = [];
    const heap = await buildHeapAsyncronouslyFromLogSources({
      asyncLogSources,
    });

    expect(heap.isEmpty()).toBe(true);
  });

  test("It should create an empty heap if all log sources are drained via the pop method", async () => {
    const asyncLogSources = [
      { popAsync: () => Promise.resolve(false) },
      { popAsync: () => Promise.resolve(false) },
    ];

    const heap = await buildHeapAsyncronouslyFromLogSources({
      asyncLogSources,
    });

    expect(heap.isEmpty()).toBe(true);
  });

  test("The top value on the heap should be the oldest date", async () => {
    const now = Date.now();
    const currentDate = new Date(now);
    const dateInThePast = new Date(now - 1000000000);
    const currentEntry = {
      date: currentDate,
      msg: "Not important for the test",
    };
    const entryInThePast = {
      date: dateInThePast,
      msg: "Not important for the test",
    };
    const asyncLogSources = [
      {
        popAsync: () => Promise.resolve(currentEntry),
        last: currentEntry,
      },
      {
        popAsync: () => Promise.resolve(entryInThePast),
        last: entryInThePast,
      },
    ];

    const heap = await buildHeapAsyncronouslyFromLogSources({
      asyncLogSources,
    });

    expect(heap.isEmpty()).toBe(false);

    const root = heap.extractRoot();
    expect(root.last).toBe(entryInThePast);
  });
});

describe("printLogEntriesAsync", () => {
  test("it should not print any log entries if the heap is empty", async () => {
    const asyncLogSources = [];

    const logStateHeap = await buildHeapAsyncronouslyFromLogSources({
      asyncLogSources,
    });

    const printer = {
      print: jest.fn(),
    };

    await printLogEntriesAsync({ logStateHeap, asyncLogSources, printer });

    expect(printer.print).not.toHaveBeenCalled();
  });

  test("it should print the root log message in the heap and get the next value from the source until all sources are drained", async () => {
    const firstLogEntry = { date: new Date(), msg: "1" };

    const popMock = jest.fn();
    popMock.mockReturnValueOnce(Promise.resolve(firstLogEntry));
    popMock.mockReturnValueOnce(Promise.resolve(false));
    const asyncLogSources = [
      {
        popAsync: popMock,
        last: firstLogEntry,
      },
    ];

    const logStateHeap = await buildHeapAsyncronouslyFromLogSources({
      asyncLogSources,
    });

    const printer = {
      print: jest.fn(),
    };

    printLogEntriesAsync({ logStateHeap, printer });

    expect(printer.print).toHaveBeenCalledTimes(1);
  });
});
