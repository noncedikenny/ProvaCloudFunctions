"use strict";
/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.dioBoninoDe = void 0;
const https_1 = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const paillierBigint = require('paillier-bigint');

// Classe ECA
class ECA {
    constructor() {
        this.publicKey = null;
        this.privateKey = null;
        this.initializeKeys();
    }

    async initializeKeys() {
        // Genera le chiavi e le assegna alle proprietà della classe
        const { publicKey, privateKey } = await paillierBigint.generateRandomKeys(512); // 512-bit chiave
        this.publicKey = publicKey;
        this.privateKey = privateKey;
        console.log("ECA keys generated.");
    }

    // Metodo per restituire la chiave pubblica
    getPublicKey() {
        return this.publicKey;
    }
}

// Classe AC
class AC {
    constructor() {
        this.publicKey = null;
        this.privateKey = null;
        this.listAC = []; // Definisci listAC come proprietà della classe
        this.initializeKeys();
    }

    async initializeKeys() {
        // Genera le chiavi e le assegna alle proprietà della classe
        const { publicKey, privateKey } = await paillierBigint.generateRandomKeys(512); // 512-bit chiave
        this.publicKey = publicKey;
        this.privateKey = privateKey;
        console.log("AC keys generated.");
    }

    // Metodo per restituire la chiave pubblica
    async getPublicKey() {
        if (!this.publicKey) {
            await this.initializeKeys();
        }
        return this.publicKey;
    }

    async getPrivateKey() {
        if (!this.privateKey) {
            await this.initializeKeys();
        }
        return this.privateKey;
    }
}

// Modifica del trigger dioBoninoDe
exports.dioBoninoDe = (0, https_1.onRequest)(async (request, response) => {
    const ac = new AC();

    // Attendi che la chiave pubblica e privata siano disponibili
    const publicKey = await ac.getPublicKey();
    const privateKey = await ac.getPrivateKey();
    
    const m = 42n;
    let encrypted, decrypted;

    try {
        encrypted = publicKey.encrypt(m);  // Cripta il messaggio
        decrypted = privateKey.decrypt(encrypted);  // Decripta il messaggio
    } catch (error) {
        return response.status(500).send("Errore durante la crittografia/decrittografia: " + error.message);
    }

    // Costruisci la risposta con i risultati
    let responseMessage = "Criptato: " + encrypted.toString() + "\n" + "Decriptato: " + decrypted.toString();

    // Rispondi una volta sola con i risultati
    response.send(responseMessage);
});
