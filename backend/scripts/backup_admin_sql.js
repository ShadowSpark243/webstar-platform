import mysql from 'mysql2/promise';
import fs from 'fs';

async function main() {
      const connection = await mysql.createConnection("mysql://root:cilFKsgfAXweWHPtjPPyylMsRUSVlYRE@mainline.proxy.rlwy.net:52438/railway");
      try {
            const [rows] = await connection.execute('SELECT * FROM User WHERE role = "ADMIN"');
            fs.writeFileSync('admin_backup.json', JSON.stringify(rows, null, 2));
            console.log(`Saved ${rows.length} admin accounts to admin_backup.json via MySQL directly.`);
      } catch (error) {
            console.error('MySQL Error:', error);
      } finally {
            await connection.end();
      }
}

main();
