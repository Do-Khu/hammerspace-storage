import { Response, Request } from 'express'
import { DeckRepository } from '../utils/repositories/decksRepository'

const _deck = new DeckRepository()

export const listDecks = async(req: Request, res: Response) =>{
    console.log("GET api/decks/:userId")
    const userid = req.query.userid || ''

    if(typeof userid !== "string" || userid === ''){
        console.log("couldn't get id param value")
        return res.status(400).send("couldn't get id param value")
    }
    
    // TODO: adicionar autenticação, OU comunicação por menssageria
    const decks = await _deck.getAll(parseInt(userid))
    if (decks instanceof Error) {
        console.log(decks.message)
        console.log(decks.stack)
        return res.status(500).send()
    }

    return res.status(200).send(decks)
}

export const createDeck = async(req: Request, res: Response) =>{
    console.log("POST api/decks")
    const deckInfo: CreateDeckDto = req.body

    if (!deckInfo.commanderCardId || !deckInfo.cardName || !deckInfo.colorIdentity || !deckInfo.deckName || !deckInfo.userId) {
        console.log("Please, inform the commanderCardId, cardName, colorIdentity, deckName and userId to register a new deck")
        return res.status(400).send()
    }

    const cards = await _deck.create(deckInfo.userId, deckInfo.deckName, deckInfo.commanderCardId, deckInfo.cardName, deckInfo.colorIdentity)
    if (cards instanceof Error) {
        console.log("error while creating deck: " + cards.message)
        console.log(cards.stack)
        return res.status(500).send("error while creating deck")
    }

    return res.status(200).send(cards)
}

export const getDeck = async(req: Request, res: Response) => {
    console.log("GET api/decks/:userid/:id")
    const param = req.query.id || ''
    const userid = req.query.userid || ''

    if(typeof param !== "string" || param === ''){
        console.log("couldn't get id param value")
        return res.status(400).send("couldn't get id param value")
    }

    if(typeof userid !== "string" || userid === ''){
        console.log("couldn't get userId param value")
        return res.status(400).send("couldn't get userId param value")
    }

    const deckId : number = parseInt(param)
    const deck = await _deck.get(deckId)
    if (deck instanceof Error) {
        console.log("error on getting deck data: " + deck.message)
        console.log(deck.stack)
        return res.status(500).send()
    }

    if(deck.userid != parseInt(userid)){
        console.log("you don't have access to this deck")
        return res.status(401).send()
    }

    const deckList = await _deck.getDeckList(deck.id)
    if (deckList instanceof Error) {
        console.log("error on getting deck cards data: " + deckList.message)
        console.log(deckList.stack)
        return res.status(500).send()
    }

    const deckResume: DeckDto = {
        id: deck.id,
        userid: deck.userid,
        deckname: deck.deckname,
        coloridentity: deck.coloridentity,
        cardname: deck.cardname,
        commandercardid: deck.commandercardid,
        ownedCards: deck.ownedCards,
        totalcards: deck.totalcards,
        cards: deckList
    }

    return res.status(200).send(deckResume)
}

export const updateDeck = async(req: Request, res: Response) => {
    console.log("POST api/decks/:id")
    const deckInfo: CreateDeckDto = req.body
    const param = req.query.id || ''

    if (!deckInfo.commanderCardId || !deckInfo.cardName || !deckInfo.colorIdentity || !deckInfo.deckName || !deckInfo.userId) {
        console.log("Please, inform the commanderCardId, cardName, colorIdentity, deckName and userId to register a new deck")
        return res.status(400).send()
    }

    if(typeof param !== "string" || param === ''){
        console.log("couldn't get id param value")
        return res.status(400).send("couldn't get id param value")
    }

    const deckId : number = parseInt(param)
    const canAccessDeck = _deck.doesDeckBelongsToUser(deckId,deckInfo.userId)
    if(canAccessDeck instanceof Error){
        console.log("Error on checking if user has access to deck")
        res.status(500).send()
    } else if (!canAccessDeck){
        console.log("you dont have access to this deck")
        res.status(401).send()
    }

    const err = await _deck.update(deckId, deckInfo.deckName, deckInfo.cardName, deckInfo.colorIdentity, deckInfo.commanderCardId)
    if (err instanceof Error) {
        console.log("error on updating deck data: " + err.message)
        console.log(err.stack)
        return res.status(500).send("error on updating deck data")
    }

    return res.status(200).send()
}

export const addCardToDeck = async(req: Request, res: Response) => {
    console.log("POST api/decks/:userid/:id/cards")
    const cardInfo: AddCardToDeckDto = req.body
    const id = req.query.id || ''
    const userid = req.query.userid || ''

    if (!cardInfo.cardId || !cardInfo.cardName || !cardInfo.coloridentity || !cardInfo.cardPrice) {
        console.log("Please, inform the cardId, cardName, colorIdentity and cardPrice to register a new deck")
        return res.status(400).send()
    }

    if(typeof id !== "string" || id === ''){
        console.log("couldn't get id param value")
        return res.status(400).send("couldn't get id param value")
    }

    if(typeof userid !== "string" || userid === ''){
        console.log("couldn't get id param value")
        return res.status(400).send("couldn't get id param value")
    }

    const deckId : number = parseInt(id)
    const canAccessDeck = _deck.doesDeckBelongsToUser(deckId, parseInt(userid))
    if(canAccessDeck instanceof Error){
        console.log("Error on checking if user has access to deck")
        res.status(500).send()
    } else if (!canAccessDeck){
        console.log("you dont have access to this deck")
        res.status(401).send()
    }

    const err = await _deck.addCard(deckId, cardInfo.cardId, cardInfo.cardName, cardInfo.cardPrice, cardInfo.coloridentity)
    if (err instanceof Error) {
        console.log("error on adding card to deck: " + err.message)
        console.log(err.stack)
        return res.status(500).send("error on adding card to deck")
    }

    return res.status(200).send()
}

export const removeCardFromDeck = async(req: Request, res: Response) => {
    console.log("POST api/decks/:userId/:id/:cardId")
    const cardInfo: AddCardToDeckDto = req.body
    const idParam = req.query.id || ''
    const cardIdParam = req.query.cardId || ''
    const userIdParam = req.query.userid || ''

    if (!cardInfo.cardId || !cardInfo.cardName || !cardInfo.coloridentity || !cardInfo.cardPrice) {
        console.log("Please, inform the cardId, cardName, colorIdentity and cardPrice to register a new deck")
        return res.status(400).send()
    }

    if(typeof idParam !== "string" || idParam === ''){
        console.log("couldn't get id param value")
        return res.status(400).send("couldn't get id param value")
    }

    if(typeof cardIdParam !== "string" || cardIdParam === ''){
        console.log("couldn't get cardid param value")
        return res.status(400).send("couldn't get cardid param value")
    }

    if(typeof userIdParam !== "string" || userIdParam === ''){
        console.log("couldn't get userid param value")
        return res.status(400).send("couldn't get userid param value")
    }

    const deckId : number = parseInt(idParam)
    const cardId : number = parseInt(cardIdParam)
    const userId : number = parseInt(userIdParam)

    const canAccessDeck = _deck.doesDeckBelongsToUser(deckId,userId)
    if(canAccessDeck instanceof Error){
        console.log("Error on checking if user has access to deck")
        res.status(500).send()
    } else if (!canAccessDeck){
        console.log("you dont have access to this deck")
        res.status(401).send()
    }

    const card = await _deck.getDeckCard(cardId)
    if (card instanceof Error) {
        console.log("error on recovering deck data: " + card.message)
        console.log(card.stack)
        return res.status(500).send("error on recovering card data")
    }

    if(card.deckid != deckId){
        return res.status(400).send("card not related to this deck")
    }

    const err = await _deck.removeCard(card)
    if (err instanceof Error) {
        console.log("error on adding card to deck: " + err.message)
        console.log(err.stack)
        return res.status(500).send("error on adding card to deck")
    }

    return res.status(200).send()
}