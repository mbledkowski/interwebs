import type pg from "pg";
import { Client } from "pg";

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

  async getNodes() {
    const dbData = await this.client.query(`
      SELECT * FROM cypher('${this.graphName}', $$ match p = (:webpage) RETURN (p) $$) as (V agtype)
    `);

    const res = dbData.rows.map((rowRaw) => {
      const row = JSON.parse(rowRaw);
      return { id: row.id, url: row.properties.url, title: row.properties.title, redirect: row.properties.redirect };
    });

    return res;
  }

  async close() {
    await this.client.end();
  }
}
