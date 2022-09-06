const Sequelize = require('sequelize');
const db = new Sequelize(process.env.DATABASE_URL || 'postgres://localhost/acme_db');
const { STRING, UUID, UUIDV4 } = Sequelize;

const express = require('express');
const app = express();


app.get('/api/departments', async (req, res, next)=>{
    try{
        res.send(await Department.findAll({
            include: [
                {
                    model: Employee,
                    as: 'manager'
                }
            ]
    }))
    }
    catch(err){

    }
})

app.get('/api/employees', async (req, res, next)=>{
    try{
        res.send(await Employee.findAll({
            include: [
                {
                    model: Employee,
                    as: 'supervisor'
                },
                {
                    model: Employee,
                    as: 'staff'
                }
            ]
    }))
    }
    catch(err){

    }
})

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



const init = async () =>{
    try{
        await db.authenticate();
        await syncAndSeed();
        const port = process.env.PORT || 3000;
        app.listen(port, ()=> console.log(`listening on port ${port}`))
    }
    catch(err){
        console.log(err)
    }
}

init();