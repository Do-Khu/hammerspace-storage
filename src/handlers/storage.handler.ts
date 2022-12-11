import { Response, Request } from 'express'
import { StorageRepository } from '../utils/repositories/storageRepository'

const _storage = new StorageRepository()

export const listStorageCards = async(req: Request, res: Response) =>{
    console.log("GET api/storage/:userid")
    console.log(req.params)
    const userId = req.params.userid || ''
    

    if(typeof userId !== "string" || userId == ''){
        console.log("couldn't get userid param value")
        return res.status(400).send("couldn't get userid param value")
    }
    
    const cards = await _storage.getAll(parseInt(userId))
    if (cards instanceof Error) {
        console.log(cards.message)
        console.log(cards.stack)
        return res.status(500).send()
    }

    return res.status(200).send(cards)
}

export const addCardToStorage = async(req: Request, res: Response) =>{
    console.log("POST api/storage/:userid")
    const userId = req.params.userid || ''
    const cardInfo: AddCardToStorageDto = req.body

    if(typeof userId !== "string" || userId == ''){
        console.log("couldn't get userid param value")
        return res.status(400).send("couldn't get userid param value")
    }

    if (!cardInfo.cardId || !cardInfo.cardname || !cardInfo.coloridentity) {
        console.log("Please, inform the cardId, cardname and coloridentity to add a new card to your storage")
        return res.status(400).send()
    }
    
    const decks = await _storage.addCard(parseInt(userId), cardInfo.cardId, cardInfo.cardname, cardInfo.coloridentity)
    if (decks instanceof Error) {
        console.log(decks.message)
        console.log(decks.stack)
        return res.status(500).send()
    }

    return res.status(200).send(decks)
}

export const findCardsByName = async(req: Request, res: Response) =>{
    console.log("GET api/storage/:userid/:name")
    const cardName = req.params.name || ''
    const userId = req.params.userid || ''

    if(typeof cardName !== "string" || cardName == ''){
        console.log("couldn't get name param value")
        return res.status(400).send("couldn't get name param value")
    }

    if(typeof userId !== "string" || userId == ''){
        console.log("couldn't get userid param value")
        return res.status(400).send("couldn't get userid param value")
    }

    const cards = await _storage.findCardByName(cardName, parseInt(userId))
    if (cards instanceof Error) {
        console.log("error on getting cards list by card name: " + cards.message)
        console.log(cards.stack)
        return res.status(500).send()
    }

    return res.status(200).send(cards)
}

export const removeCardFromStorage = async(req: Request, res: Response) => {
    console.log("GET api/storage/:userid/:id/remove")
    const param = req.params.id || ''
    const userid = req.params.userid || ''

    if(typeof param !== "string" || param === ''){
        console.log("couldn't get id param value")
        return res.status(400).send("couldn't get id param value")
    }

    if(typeof userid !== "string" || userid == ''){
        console.log("couldn't get userid param value")
        return res.status(400).send("couldn't get userid param value")
    }

    const storageId : number = parseInt(param)
    const card = await _storage.get(storageId)
    if (card instanceof Error) {
        console.log("error on getting card data: " + card.message)
        console.log(card.stack)
        return res.status(500).send("error on recovering card data when removing it")
    }

    if(card.userid != parseInt(userid)){
        console.log("you don't have access to this deck")
        return res.status(401).send()
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
    const param = req.params.id || ''
    const userid = req.params.userid || ''

    if(typeof param !== "string" || param === ''){
        console.log("couldn't get id param value")
        return res.status(400).send("couldn't get id param value")
    }
    
    if(typeof userid !== "string" || userid == ''){
        console.log("couldn't get userid param value")
        return res.status(400).send("couldn't get userid param value")
    }

    const storageId : number = parseInt(param)
    const card = await _storage.get(storageId)
    if (card instanceof Error) {
        console.log("error on getting card data: " + card.message)
        console.log(card.stack)
        return res.status(500).send("error on recovering card data when updating it")
    }

    if(card.userid != parseInt(userid)){
        console.log("you don't have access to this deck")
        return res.status(401).send()
    }

    await _storage.update(storageId, !card.isreserved).catch((error) => {
        console.log("Error while updating card state: " + error.message)
        console.log(error.stack)
        return res.status(500).send("Error while updating card state")
    })

    return res.status(200).send()
}