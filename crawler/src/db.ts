import pg from "pg";
const Pool = pg.Pool;

export class Database {
  pool: pg.Pool;
  graphName: string;

  constructor() {
    this.pool = new Pool({
      database: "postgresDB",
      host: "localhost",
      password: "postgres",
      port: 5455,
      user: "interwebs",
    });
    this.graphName = "interwebs";
  }

  async build() {
    await this.pool.connect();
    await this.pool.query(`
      CREATE EXTENSION IF NOT EXISTS age;
      LOAD 'age';
      SET search_path = ag_catalog, "$user", public;
    `);
  }

  async createDatabase() {
    await this.pool.query(`SELECT create_graph('${this.graphName}');`);
  }

  async addWebPage(
    url: string,
    title: string,
    links: string[],
    redirect: boolean
  ) {
    try {
      await this.pool.query(`
        SELECT *
        FROM cypher('interwebs', $$
            MERGE (page:webpage {url: "${url}"})
            SET page.title = "${title}", page.redirect = ${redirect}
        $$) AS (page agtype)
    `);

      const queueOfPromises: Promise<pg.QueryResult>[] = [];
      for (let link of links) {
        queueOfPromises.push(
          this.pool.query(`
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
      await this.pool.query(`SELECT drop_graph('${this.graphName}', true);`);
    } catch (err) {
      console.log(err);
    }
  }

  close() {
    this.pool.end();
  }
}
