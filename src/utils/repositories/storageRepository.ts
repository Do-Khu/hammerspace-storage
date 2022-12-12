import { Like, Repository } from "typeorm";
import { Storage } from "../../models/entities/storage.model";
import { db } from "../database.utils"

// Classe que realiza a conexão e consulta com a tabela 'storage' do banco de dados
export class StorageRepository{
    private storageRepository!: Repository<Storage>;
    constructor(){
        this.init()
    }

    private async init(){
        if (!db.isInitialized)
            await db.initialize()
            .then(()=>{
                this.storageRepository = db.getRepository(Storage)
            }).catch((error) => {
                console.log("Error on db conn: " + error.message)
                console.log(error.stack)
            })
    }

    // Add cards to storage
    async addCard(userId: number, cardId:number, cardName: string, coloridentity: string) : Promise<Error | undefined> {
        await this.init()
        // TODO: Fazer paginação deste metodo
        const card = await this.storageRepository.create({
            userid: userId,
            cardname: cardName,
            coloridentity: coloridentity,
            cardid: cardId,
            isreserved: false
        })
        await this.storageRepository.save(card).catch((err) => {
            console.log("Db error while adding Card to storage: " + err.message)
            console.log(err.stack)
            return err
        })
        .finally(()=>{db.destroy()})
        return ;
    }

    // list all Cards on storage
    async getAll(userId: number) : Promise<Storage[] | Error> {
        await this.init()
        // TODO: Fazer paginação deste metodo
        const cards = await this.storageRepository.find({
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

    // get card data by id
    async get(id: number) : Promise<Storage | Error>{
        await this.init()
        const card = await this.storageRepository.query(`select * from "storage" where id='${id}' LIMIT 1;`).catch((err) => {
            console.log("Db error on getting specific storage card data: " + err.message)
            console.log(err.stack)
            return err
        })
        .finally(()=>{db.destroy()})
        return card
    }

    // get card data by id
    async update(id: number, isReserved: boolean) : Promise<Storage | Error>{
        await this.init()
        const card = await this.storageRepository.update({id: id}, {isreserved: isReserved}).catch((err) => {
            console.log("Db error on getting specific storage card data: " + err.message)
            console.log(err.stack)
            return err
        })
        .finally(()=>{db.destroy()})
        return card
    }

    // list all Cards by name
    async findCardByName(cardName: string, userId: number) : Promise<Storage[] | Error> {
        await this.init()
        // TODO: Fazer paginação deste metodo
        const cards = await this.storageRepository.find({
            where: { 
                cardname: Like(cardName),
                userid: userId
            },
            take: 10
        })
        .catch((err) => {
            console.log("Db error while getting Card list: " + err.message)
            console.log(err.stack)
            return err
        })
        .finally(()=>{db.destroy()})
        return cards || [];
    }

    // get card data by id
    async findNonUsedCardsById(id: number) : Promise<Storage | Error>{
        await this.init()
        const card = await this.storageRepository.findOne({
            where:{
                cardid: id,
                isreserved: false
            }
        }).catch((err) => {
        // const card = await this.storageRepository.query(`select * from "storage" where cardid='${id}' and isreserved = false LIMIT 1;`).catch((err) => {
            console.log("Db error on getting specific storage card data: " + err.message)
            console.log(err.stack)
            return err
        })
        .finally(()=>{db.destroy()})
        return card
    }

    async removeCard(card: Storage) : Promise<Error | undefined>{
        await this.storageRepository.remove(card).catch((error) => {
            console.log("Error while removing card from storage: " + error.message)
            console.log(error.stack)
            return error
        })

        return 
    }

    // check if deck belongs to user x
    async doesCardBelongsToUser(cardId: number, userId: number): Promise<boolean | Error>{
        let result = false

        const count = await this.storageRepository.findAndCount({
            where:{
                id: cardId,
                userid: userId
            }
        }).catch((err) => {
            console.log("Db error on checking if user can access storage data: " + err.message)
            console.log(err.stack)
            return err
        })

        if (count > 0)
            result = true

        return result
    }
}