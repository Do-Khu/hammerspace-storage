import express from 'express'
import { addCardToDeck, createDeck, getDeck, listDecks, removeCardFromDeck, updateDeck } from '../handlers/deck.handler'
import { listStorageCards, addCardToStorage, findCardsByName, removeCardFromStorage, reserveCardFromStorage } from '../handlers/storage.handler'

const router = express.Router()

router.get('/storage', listStorageCards)
router.get('/storage/:id/remove', removeCardFromStorage)
router.get('/storage/:id/reserve', reserveCardFromStorage)
router.get('/storage/:name', findCardsByName)
router.post('/storage', addCardToStorage)

router.get('/decks', listDecks)
router.get('/decks/:id', getDeck)
router.post('/decks', createDeck)
router.post('/decks/:id', updateDeck)
router.post('/decks/:id/cards', addCardToDeck)
router.post('/decks/:id/:cardId', removeCardFromDeck)

export default router