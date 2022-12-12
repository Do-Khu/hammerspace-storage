import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({
    database: "hammerspace_storage",
    name: "storage",
    schema: "public"
})
export class Storage{
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    userid!: number;

    @Column()
    cardid!: number;

    @Column()
    cardname!: string;

    @Column()
    coloridentity!: string;

    @Column()
    isreserved!: boolean;

    @Column({ nullable:true})
    deckid!: number;
}