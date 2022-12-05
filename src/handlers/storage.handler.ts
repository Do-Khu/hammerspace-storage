import { Response, Request } from 'express'
import { StorageRepository } from '../utils/repositories/storageRepository'

const _storage = new StorageRepository()

export const listStorageCards = async(req: Request, res: Response) =>{
    console.log("GET api/storage")
    
    // TODO: adicionar autenticação, OU comunicação por menssageria
    const cards = await _storage.getAll()
    if (cards instanceof Error) {
        console.log(cards.message)
        console.log(cards.stack)
        return res.status(500).send()
    }

    return res.status(200).send(cards)
}

export const addCardToStorage = async(req: Request, res: Response) =>{
    console.log("POST api/storage")
    const cardInfo: AddCardToStorageDto = req.body

    if (!cardInfo.cardId || !cardInfo.cardname || !cardInfo.coloridentity) {
        console.log("Please, inform the cardId, cardname and coloridentity to add a new card to your storage")
        return res.status(400).send()
    }
    
    // TODO: adicionar autenticação, OU comunicação por menssageria
    const decks = await _storage.addCard(cardInfo.cardId, cardInfo.cardname, cardInfo.coloridentity)
    if (decks instanceof Error) {
        console.log(decks.message)
        console.log(decks.stack)
        return res.status(500).send()
    }

    return res.status(200).send(decks)
}

export const findCardsByName = async(req: Request, res: Response) =>{
    console.log("GET api/storage/:name")
    const cardName = req.query.name || ''

    if(typeof cardName !== "string" || cardName == ''){
        console.log("couldn't get name param value")
        return res.status(400).send("couldn't get name param value")
    }
    // TODO: adicionar autenticação, OU comunicação por menssageria
    const cards = await _storage.findCardByName(cardName)
    if (cards instanceof Error) {
        console.log("error on getting cards list by card name: " + cards.message)
        console.log(cards.stack)
        return res.status(500).send()
    }

    return res.status(200).send(cards)
}

export const removeCardFromStorage = async(req: Request, res: Response) => {
    console.log("GET api/storage/:id/remove")
    const param = req.query.id || ''

    if(typeof param !== "string" || param === ''){
        console.log("couldn't get id param value")
        return res.status(400).send("couldn't get id param value")
    }

    const storageId : number = parseInt(param)
    const card = await _storage.get(storageId)
    if (card instanceof Error) {
        console.log("error on getting card data: " + card.message)
        console.log(card.stack)
        return res.status(500).send("error on recovering card data when removing it")
    }

    await _storage.removeCard(card).catch((error) => {
        console.log("Error while removing card from storage: " + error.message)
        console.log(error.stack)
        return res.status(500).send("Error while removing card from storage")
    })

    return res.status(200).send()

}

export const reserveCardFromStorage = async(req: Request, res: Response) => {
    console.log("GET api/storage/:id/reserve")
    const param = req.query.id || ''

    if(typeof param !== "string" || param === ''){
        console.log("couldn't get id param value")
        return res.status(400).send("couldn't get id param value")
    }

    const storageId : number = parseInt(param)
    const card = await _storage.get(storageId)
    if (card instanceof Error) {
        console.log("error on getting card data: " + card.message)
        console.log(card.stack)
        return res.status(500).send("error on recovering card data when updating it")
    }

    await _storage.update(storageId, !card.isreserved).catch((error) => {
        console.log("Error while updating card state: " + error.message)
        console.log(error.stack)
        return res.status(500).send("Error while updating card state")
    })

    return res.status(200).send()

}