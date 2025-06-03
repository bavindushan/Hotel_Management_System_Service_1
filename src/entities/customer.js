const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
    name: "Customer",
    tableName: "Customer",
    columns: {
        id: {
            primary: true,
            type: "int",
            generated: true,
        },
        full_name: {
            type: "varchar",
            length: 100,
            nullable: false,
        },
        email: {
            type: "varchar",
            length: 100,
            unique: true,
            nullable: false,
        },
        phone: {
            type: "varchar",
            length: 20,
            nullable: true,
        },
        address: {
            type: "text",
            nullable: true,
        },
        password_hash: {
            type: "varchar",
            length: 255,
            nullable: true,
        },
        created_at: {
            type: "timestamp",
            createDate: true, 
        },
    },
});
