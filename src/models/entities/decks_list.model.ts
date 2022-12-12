import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({
    database: "hammerspace_storage",
    name: "deck_list",
    schema: "public"
})
export class DeckList{
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    cardid!: number;

    @Column()
    cardname!: string;

    @Column()
    coloridentity!: string;

    @Column()
    shouldBuyCard!: boolean;

    @Column()
    deckid!: number;

    @Column()
    storageId!: number;
}