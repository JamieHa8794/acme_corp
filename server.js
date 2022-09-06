const Sequelize = require('sequelize');
const db = new Sequelize(process.env.DATABASE_URL || 'postgres://localhost/acme_db');
const { STRING } = Sequelize;


const Department = db.define('department', {
    name :{
        type : STRING
    }
});

const Employee = db.define('employee',{
    name :{
        type : STRING
    }
});

const syncAndSeed = async () =>{
    try{
        await db.sync({ force: true })
        const [moe, lucy, hr, engineering ] = await Promise.all([
            Employee.create({name : 'Moe'}),
            Employee.create({name : 'Lucy'}),
            Department.create({name: 'HR'}),
            Department.create({name: 'Engineering'})
        ])
    }
    catch(err){
        console.log(err)
    }
}


const init = async () =>{
    try{
        await db.authenticate();
        await syncAndSeed();
    }
    catch(err){
        console.log(err)
    }
}

init();