import { createClient } from '@libsql/client';
import fs from 'fs';
import path from 'path';

async function migrate() {
    const url = "libsql://hiuborama-maandev.aws-eu-west-1.turso.io";
    const authToken = "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJleHAiOjE4MTYwMjUyMzMsImlhdCI6MTc4NDQ4OTIzMywiaWQiOiIwMTlmN2JkOC00ZDAxLTdlNzMtYjU4Yy03NWM2NDhiMDBlNjMiLCJraWQiOiIzNGFESnhIVVBHMHJqY0pZblhvN1dpUU5HOGN0SE9KazhLMmFINUpoUnp3IiwicmlkIjoiNjQzY2Q2YWMtY2MwMi00ZmNiLWI4YTctMmVhNDBjYzVlYzFmIn0.UPH7njoeBuSl0lg62UGBdNPGwX5PW_Xf86Cc8JDRQf16H90v2ussxLy00JO0V71G9lHEv-5OCKIBvPdib3-zBQ";

    console.log('Connecting to Turso...');
    const client = createClient({ url, authToken });

    const sqlPath = path.join(__dirname, 'prisma', 'migrations', 'add_grading_scale.sql');
    console.log('Reading migration file:', sqlPath);
    const sql = fs.readFileSync(sqlPath, 'utf8');

    // Split by statement (rudimentary split by ; but ignoring inside strings isn't strictly necessary for our schema since it's just CREATE TABLE and CREATE INDEX)
    const statements = sql.split(';').map(s => s.trim()).filter(s => s.length > 0);

    console.log(`Executing ${statements.length} statements...`);
    
    // LibSQL client doesn't have an executeMultiple, so we do it in a transaction
    const transaction = await client.transaction("write");
    try {
        for (const stmt of statements) {
            await transaction.execute(stmt);
        }
        await transaction.commit();
        console.log('Migration applied successfully!');
    } catch (e) {
        await transaction.rollback();
        console.error('Migration failed:', e);
        process.exit(1);
    }
}

migrate();
