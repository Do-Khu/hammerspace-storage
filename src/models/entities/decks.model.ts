import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({
    database: "hammerspace_storage",
    name: "decks",
    schema: "public"
})
export class Deck{
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    userid!: number;

    @Column()
    deckname!: string;

    @Column()
    coloridentity!: string;

    @Column()
    commandercardid!: number;

    @Column()
    cardname!: string;

    @Column()
    totalcards!: number;

    @Column()
    ownedCards!: number;
}