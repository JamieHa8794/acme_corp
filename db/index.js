const Sequelize = require('sequelize');
const db = new Sequelize(process.env.DATABASE_URL || 'postgres://localhost/acme_db');
const { STRING, UUID, UUIDV4 } = Sequelize;


const Department = db.define('department', {
    name :{
        type : STRING(20),
        allowNull: false,
        unique: true        
    }
});

const Employee = db.define('employee',{
    id:{
        type: UUID,
        primaryKey: true,
        defaultValue: UUIDV4
    },
    name :{
        type : STRING(20),
        allowNull: false,
        unique: true
    }
});


Department.belongsTo(Employee, {as: 'manager'});
Employee.hasMany(Department, {foreignKey: 'managerId'});

Employee.belongsTo(Employee, {as : 'supervisor'})
Employee.hasMany(Employee, {foreignKey: 'supervisorId', as: 'staff'})



const syncAndSeed = async () =>{
    try{
        await db.sync({ force: true })
        const [moe, lucy, larry, hr, engineering ] = await Promise.all([
            Employee.create({name : 'Moe'}),
            Employee.create({name : 'Lucy'}),
            Employee.create({name : 'Larry'}),
            Department.create({name: 'HR'}),
            Department.create({name: 'Engineering'})
        ])
        hr.managerId = lucy.id;
        await hr.save();
        moe.supervisorId = lucy.id;
        await moe.save();
        larry.supervisorId = lucy.id;
        await larry.save();
    }
    catch(err){
        console.log(err)
    }
}

module.exports = {
    db,
    syncAndSeed,
    models: {
        Department,
        Employee
    }
}