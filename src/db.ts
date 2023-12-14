import pg from "pg";
const Client = pg.Client;

export class Database {
  client: pg.Client;
  graphName: string;

  constructor() {
    this.client = new Client({
      database: "postgresDB",
      host: "localhost",
      password: "postgres",
      port: 5455,
      user: "interwebs",
    });
    this.graphName = "interwebs";
  }

  async build() {
    await this.client.connect();
    await this.client.query(`
      CREATE EXTENSION IF NOT EXISTS age;
      LOAD 'age';
      SET search_path = ag_catalog, "$user", public;
    `);
  }

  async createDatabase() {
    await this.client.query(`SELECT create_graph('${this.graphName}');`);
  }

  async addWebPage(
    url: string,
    title: string,
    links: string[],
    redirect: boolean
  ) {
    try {
      await this.client.query(`
        SELECT *
        FROM cypher('interwebs', $$
            MERGE (page:webpage {url: "${url}"})
            SET page.title = "${title}", page.redirect = ${redirect}
        $$) AS (page agtype)
    `);

      const queueOfPromises: Promise<pg.QueryResult>[] = [];
      for (let link of links) {
        queueOfPromises.push(
          this.client.query(`
        SELECT *
        FROM cypher('interwebs', $$
          MATCH (page:webpage {url: "${url}"})
          MERGE (linkedPage:webpage {url: "${link}"})
          MERGE (page)-[:linksTo]->(linkedPage)
          RETURN {page: page, linkedPage: linkedPage}
        $$) AS (result agtype)
      `)
        );
      }
      await Promise.all(queueOfPromises);
    } catch (err) {
      console.log(err);
    }
  }

  async dropDatabase() {
    try {
      await this.client.query(`SELECT drop_graph('${this.graphName}', true);`);
    } catch (err) {
      console.log(err);
    }
  }

  close() {
    this.client.end();
  }
}
