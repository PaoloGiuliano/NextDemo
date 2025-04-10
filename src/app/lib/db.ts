import { Pool, PoolConfig } from "pg";

const poolConfig: PoolConfig = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 5432,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
};
const pool = new Pool(poolConfig);
pool.on("error", (err: Error, client: any) => {
  console.error("Unexpected error on idle client", err);
  process.exit(-1);
});

export default pool;
