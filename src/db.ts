import gremlin from "gremlin";

export class Database {
  connection: gremlin.driver.DriverRemoteConnection;
  g: gremlin.process.GraphTraversalSource<gremlin.process.GraphTraversal>;
  queue: Function[];

  constructor() {
    this.connection = new gremlin.driver.DriverRemoteConnection(
      "ws://localhost:8182/gremlin",
      "g"
    );
    this.g = gremlin.process.AnonymousTraversalSource.traversal().withRemote(
      this.connection
    );
    this.queue = [
      async () => {
        await new Promise((resolve) => setTimeout(resolve, 3000));
      },
    ];
  }

  async connectToVertex(
    mainVertex: IteratorResult<gremlin.structure.Vertex>,
    link: string
  ) {
    let destinationVertex = await this.g
      .V()
      .has("url", link)
      .fold()
      .coalesce(
        gremlin.process.statics.unfold(),
        gremlin.process.statics.addV("webpage").property("url", link)
      )
      .next();
    return await this.g
      .V(mainVertex.value.id)
      .addE("linksTo")
      .to(destinationVertex.value)
      .next();
  }

  async addWebPage(
    url: string,
    title: string,
    links: string[],
    redirect: boolean
  ) {
    this.queue.push(async () => {
      let err = true;
      let i = 0;
      while (err && i < 3) {
        try {
          let pageVertex = await this.g
            .addV("webpage")
            .property("url", url)
            .property("title", title)
            .property("redirect", redirect)
            .next();

          // const queueOfProcesses = [];
          for (const link of links) {
            // queueOfProcesses.push(this.connectToVertex(pageVertex, link));
            await this.connectToVertex(pageVertex, link);
          }
          // await Promise.all(queueOfProcesses);
          err = false;
        } catch (e) {
          console.log(`Error adding webpage - ${i}`);
          console.log(e);
          i++;
        }
      }
    });
  }

  async commit() {
    while (this.queue.length > 0) {
      for (const process of this.queue) {
        await process();
      }
    }
  }

  async dropDatabase() {
    await this.g.V().drop().iterate();
  }

  close() {
    this.connection.close();
  }
}
