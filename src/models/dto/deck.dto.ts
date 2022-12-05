type DeckDto = {
    id: number,
    userid: number,
    deckname: string,
    coloridentity: string,
    commandercardid: number,
    cardname: string,
    totalcards: number,
    ownedCards: number;
    cards: DeckCard[]
}