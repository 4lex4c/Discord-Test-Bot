// Importación de la Biblioteca de Discord.js y Módulos de Node
const fs = require("node:fs");
const path = require("node:path");
const { Client, Collection, Events, GatewayIntentBits } = require("discord.js");
const { token } = require("./config.json");

// Crea una nueva Instancia a partir de la clase Client
const client = new Client({ intents: [GatewayIntentBits.Guilds]});

client.commands = new Collection();

// Cuando el cliente (bot) esté listo, se ejecuta este código sólo una vez (once).
// Imprime en la consola un mensaje avisando que el cliente está listo para operar y conectado correctamente a Discord.
client.once(Events.ClientReady, readyClient => {
    console.log(`Conectado a Discord y listo para operar, soy ${readyClient.user.username}`);
});

client.login(token);