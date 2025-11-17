const dbName = 'ADCU';
const appUser = 'adcuUser';
const appPass = 'adcuPass123';

print(`Creating database: ${dbName}`);


const mydb = db.getSiblingDB(dbName);

print(`Creating user: ${appUser}`);

// Crear la base de datos
try{

    mydb.createUser({
        user: appUser,
        pwd: appPass,
        roles: [
            {
                role: 'readWrite',
                db: dbName,
            },
        ],
    })
}catch(e){
    print(`Error creating user: ${e}`);
}

// Crear una colección de ejemplo

try{
    mydb.users.insertOne({
        firsName:'admin',
        idcard:'00000000',
        telephone:'0000000000',
        email:'admin@example.com',
        password:'$2b$10$AYSc2tVvezEH6zflemu11.mGKRnMIlpqeNY9rYUcZRclVw721Xdii', // hashed password CarlosAdmin2024
        state: true,
        post: 'ADMIN',
        role:'admin',
    });
}catch(e){
    print(`Error creating collection or inserting document: ${e}`);
}

print('Database initialization completed.');
