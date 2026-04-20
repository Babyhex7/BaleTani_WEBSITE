const { sequelize } = require('../src/config/database');

async function run(){
  try{
    await sequelize.authenticate();
    const [rows] = await sequelize.query('SHOW COLUMNS FROM stock_history');
    console.log('COLUMNS:');
    rows.forEach(col=> console.log(`${col.Field} | ${col.Type} | ${col.Null} | ${col.Default}`));
    process.exit(0);
  }catch(e){
    console.error('ERROR:', e.message);
    process.exit(1);
  }
}
run();
