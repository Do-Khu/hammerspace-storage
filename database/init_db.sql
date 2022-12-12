CREATE USER hammerspace WITH PASSWORD 'hammerspace';
CREATE DATABASE hammerspace_storage;
GRANT ALL PRIVILEGES ON DATABASE hammerspace_storage TO hammerspace;

\c hammerspace_storage

CREATE TABLE IF NOT EXISTS "decks" (
    id SERIAL PRIMARY KEY,
    userId INTEGER NOT NULL,
    deckName VARCHAR(150) NOT NULL,
    colorIdentity VARCHAR(10) NOT NULL,
    commandercardId INTEGER NOT NULL,
    cardName VARCHAR(145) NOT NULL,
    totalCards INTEGER,
    ownedCards INTEGER
);
ALTER TABLE "decks" OWNER TO hammerspace;

CREATE TABLE IF NOT EXISTS "storage" (
    id SERIAL PRIMARY KEY,
    userId INTEGER NOT NULL,
    cardId INTEGER NOT NULL,
    cardName VARCHAR(145) NOT NULL,
    colorIdentity VARCHAR(10) NOT NULL,
    isReserved BOOLEAN,
    deckId INTEGER REFERENCES "decks"(id)
);
ALTER TABLE "storage" OWNER TO hammerspace;

CREATE TABLE IF NOT EXISTS "deck_list" (
    id SERIAL PRIMARY KEY,
    cardId INTEGER NOT NULL,
    cardName VARCHAR(145) NOT NULL,
    colorIdentity VARCHAR(10) NOT NULL,
    shouldBuyCard BOOLEAN,
    storageId INTEGER REFERENCES "storage"(id),
    deckId INTEGER REFERENCES "decks"(id)
);
ALTER TABLE "deck_list" OWNER TO hammerspace;

CREATE OR REPLACE FUNCTION deck_cards_resume(_deckId) AS
    RETURNS TABLE (cardId INTEGER, cardName VARCHAR(145), colorIdentity VARCHAR(10), amount INTEGER, storageAmount INTEGER, reservedStorageAmount INTEGER)
AS 
$body$
    SELECT DL.cardId, DL.cardName, DL.colorIdentity, COUNT(DL.cardId) AS amount, COUNT(CASE WHEN S.isReserved THEN 0 ELSE 1 END) AS storageAmount, COUNT(CASE WHEN S.isReserved THEN 1 END) AS reservedStorageAmount 
    FROM "deck_list" deck_list DL
    INNER JOIN "storage" S ON S.id = DL.storageId
    WHERE DL.deckId = $1
    GROUP BY DL.cardId, DL.cardName
$body$
language sql;