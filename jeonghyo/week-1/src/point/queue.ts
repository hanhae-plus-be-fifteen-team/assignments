class QueueItem {
    constructor(
      public readonly func: () => Promise<any>,
      public readonly args: any[]
    ) {}
  }