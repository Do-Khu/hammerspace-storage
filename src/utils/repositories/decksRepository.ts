import { error } from "console";
import { get } from "http";
import { stringify } from "querystring";
import { EntityManager, IsNull, Not, QueryRunner, Repository } from "typeorm";
import { Deck } from "../../models/entities/decks.model";
import { DeckList } from "../../models/entities/decks_list.model";
import { Storage } from "../../models/entities/storage.model";
import { db } from "../database.utils"
import { StorageRepository } from "./storageRepository";

// Classe que realiza a conexão e consulta com a tabela 'storage' do banco de dados
export class DeckRepository{
    private deckRepository!: Repository<Deck>;
    private deckListRepository!: Repository<DeckList>;
    private storageRepository!: StorageRepository;
    private queryRunner!: EntityManager;

    constructor(){
        this.init()
        this.storageRepository = new StorageRepository()
    }

    private async init(){
        if (!db.isInitialized)
            await db.initialize()
            .then(()=>{
                this.deckRepository = db.getRepository(Deck)
                this.deckListRepository = db.getRepository(DeckList)
                this.queryRunner = db.createEntityManager()
            }).catch((error) => {
                console.log("Error on db conn: " + error.message)
                console.log(error.stack)
            })
    }

    // create new deck
    async create(userId: number, deckName: string, commanderCardId: number, cardName: string, colorIdentity: string) : Promise<Error | undefined>{
        const deck = this.deckRepository.create({
            deckname: deckName,
            userid: userId,
            commandercardid: commanderCardId,
            cardname: cardName,
            coloridentity: colorIdentity,
            totalcards: 0,
            ownedcards: 0
        })

        this.deckRepository.save(deck).catch((error) => {
            console.log("Error while creating deck: " + error.message)
            console.log(error.stack)
            return error
        })

        return
    }

    // Add card to deck
    async addCard(deckId: number, cardId:number, cardName: string, coloridentity: string) : Promise<Error | undefined> {
        await this.init()
        // TODO: Fazer paginação deste metodo
        let card = await this.deckListRepository.create({
            deckid: deckId,
            cardid: cardId,
            cardname: cardName,
            coloridentity: coloridentity,
            shouldBuyCard: true
        })

        // check if card is available on storage, if yes, reserve card for this deck
        let storage = this.storageRepository.findNonUsedCardsById(cardId)
        if (storage instanceof Storage && storage.id != 0){
            card.shouldBuyCard = false
            card.storageId = storage.id
            this.storageRepository.update(storage.id, true).catch((err) => {
                console.log("Db error while updating storage card state to reserved: " + err.message)
                console.log(err.stack)
                return err
            })
        }

        await this.deckListRepository.save(card).catch((err) => {
            console.log("Db error while adding Card to deck: " + err.message)
            console.log(err.stack)
            return err
        })

        // update deck cards count
        let deck = await this.get(deckId).catch((err) => {
            return err
        })
        .finally(()=>{db.destroy()})
        if (deck instanceof Deck)
        {
            deck.totalcards++
            deck.ownedcards = (storage instanceof Storage && storage.id != 0 ? deck.ownedcards++ : deck.ownedcards)
        }

        return 
    }

    // remove card from deck
    async removeCard(card: DeckList) : Promise<Error | undefined>{
        await this.init()

        this.deckListRepository.remove(card).catch((err) => {
            console.log("Db error while removing Card from deck: " + err.message)
            console.log(err.stack)
            return err
        })

        // set card state as available to use again
        if(card.storageId != undefined)
            this.storageRepository.update(card.storageId, false)
        
        // update deck cards count
        let deck = await this.get(card.deckid).catch((err) => {
            return err
        })
        .finally(()=>{db.destroy()})
        if (deck instanceof Deck)
        {
            deck.totalcards--
            deck.ownedcards = (card.storageId != undefined && card.storageId != 0 ? deck.ownedcards-- : deck.ownedcards)
        }
        return 
    }

    // list all decks
    async getAll(userId: number) : Promise<Deck[] | Error> {
        await this.init()
        // TODO: Fazer paginação deste metodo
        const cards = await this.deckRepository.find({
            where:{ userid: userId }
            // take:100
        })
        .catch((err) => {
            console.log("Db error while getting Card list: " + err.message)
            console.log(err.stack)
            return err
        })
        .finally(()=>{db.destroy()})
        return cards || [];
    }

    // list all cards on storage
    async getDeckList(deckId: number) : Promise<DeckCard[] | Error> {
    // async getDeckList(deckId: number) : Promise<DeckList[] | Error> {
        await this.init()
        // i hate typeorm he makes using a function a challenge
        const cards = await this.queryRunner.query(`select * from deck_cards_resume(${deckId});`)
        // const cards = await this.deckListRepository.find({
        //     where: {deckid: deckId}
        // })
        .catch((err) => {
            console.log("Db error while getting Card list: " + err.message)
            console.log(err.stack)
            return err
        })
        .finally(()=>{db.destroy()})
        console.log(cards)
        return cards || [];
    }

    // update deck 
    async update(deckId: number, deckName: string, cardName: string, colorIdentity: string, commanderCardId:number) : Promise<Error | undefined>{
        const countDeckList = await this.deckListRepository.count()
        const countOwnedCards = await this.deckListRepository.countBy({storageId: Not(IsNull())})
        this.deckRepository.update({id: deckId}, {
            deckname: deckName,
            cardname: cardName,
            coloridentity: colorIdentity,
            commandercardid:commanderCardId,
            totalcards: countDeckList,
            ownedcards: countOwnedCards
        }).catch((error) => {
            console.log("Error when updating deck information: " + error.message)
            console.log(error.stack)
            return error
        }).finally(()=>{db.destroy()})
        return ;
    }

    // get deck data by id
    async get(id: number) : Promise<Deck | Error>{
        await this.init()
        // const card = await this.deckRepository.query(`select * from "deck" where id='${id}' LIMIT 1;`).catch((err) => {
        const card = await this.deckRepository.findOneBy({id: id}).catch((err) => {
            console.log("Db error on getting specific deck data: " + err.message)
            console.log(err.stack)
            return err
        })
        .finally(()=>{db.destroy()})
        return card
    }

    // get deck card data by id
    async getDeckCard(id: number) : Promise<DeckList | Error>{
        await this.init()
        // const card = await this.deckRepository.query(`select * from "deck" where id='${id}' LIMIT 1;`).catch((err) => {
        const card = await this.deckListRepository.findOneBy({id: id}).catch((err) => {
            console.log("Db error on getting specific deck card data: " + err.message)
            console.log(err.stack)
            return err
        })
        .finally(()=>{db.destroy()})
        return card
    }

    // check if deck belongs to user x
    async doesDeckBelongsToUser(deckId: number, userId: number): Promise<boolean | Error>{
        let result = false

        const count = await this.deckRepository.findAndCount({
            where:{
                id: deckId,
                userid: userId
            }
        }).catch((err) => {
            console.log("Db error on checking if user can access deck data: " + err.message)
            console.log(err.stack)
            return err
        })

        if (count > 0)
            result = true

        return result
    }
}