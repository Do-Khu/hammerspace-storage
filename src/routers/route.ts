import express from 'express'
import { addCardToDeck, createDeck, getDeck, listDecks, removeCardFromDeck, updateDeck } from '../handlers/deck.handler'
import { listStorageCards, addCardToStorage, findCardsByName, removeCardFromStorage, reserveCardFromStorage } from '../handlers/storage.handler'

const router = express.Router()

router.get('/storage/:userid', listStorageCards)
router.get('/storage/:userid/:id/remove', removeCardFromStorage)
router.get('/storage/:userid/:id/reserve', reserveCardFromStorage)
router.get('/storage/:userid/:name', findCardsByName)
router.post('/storage/:userid', addCardToStorage)

router.get('/decks/:userid', listDecks)
router.get('/decks/:userid/:id', getDeck)
router.post('/decks', createDeck)
router.post('/decks/:id', updateDeck)
router.post('/decks/:userid/:id/cards', addCardToDeck)
router.get('/decks/:userid/:id/:cardId', removeCardFromDeck)

export default router