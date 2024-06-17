// Importación de la Biblioteca de Discord.js y Módulos de Node
const fs = require("node:fs");
const path = require("node:path");
const { Client, Collection, Events, GatewayIntentBits } = require("discord.js");
const { token } = require("./config.json");

// Crea una nueva Instancia a partir de la clase Client
const client = new Client({ intents: [GatewayIntentBits.Guilds]});

// Añade una nueva propiedad 'commands' al client y lo inicializa como una nueva colección
// (tipo de mapa especializado proporcionado por discord.js para almacenar datos)
client.commands = new Collection();

// Se crea una variable llamada 'foldersPath' donde se guarda la ruta a la carpeta 'commands' con path.join...
//... dentro del directorio actual '__dirname'
const foldersPath = path.join(__dirname, 'commands');
// `fs.readdirSync(foldersPath)` lee de forma sincrónica todos los nombres de las carpetas dentro de `foldersPath`...
// y los almacena en la constante llamada 'commandFolders'
const commandFolders = fs.readdirSync(foldersPath);

// Se inicia un Bucle `for...of` para iterar sobre cada una de las carpetas en 'commandFolders'
for (const folder of commandFolders) {
    // Se crea una ruta a la carpeta específica de comandos combinando 'foldersPath' y 'folder'
    const commandsPath = path.join(foldersPath, folder);
    // Lee de forma sincrónica todos los nombres de los archivos en 'commandsPath' con un filtro para incluir solo...
    //... los archivos que terminen en '.js'
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    // Se inicia un Bucle `for...of` para iterar sobre cada archivo en 'commandFiles'
    for (const file of commandFiles) {
        // Crea la ruta comlpeta al archivo combinando 'commandsPath' y 'file'
        const filePath = path.join(commandsPath, file);
        // Importa el módulo especificado por 'filePath'
        const command = require(filePath);

        // Verifica si el objeto 'command' tiene las propiedades `data` y `execute`
        if ('data' in command && 'execute' in command) {
            // Añade el comando a la colección 'commands' del cliente, usando el nombre del comando...
            //... (`command.data.name`) como clave y el objeto del comando como valor
            client.commands.set(command.data.name, command);
        } else {
            console.log(`[Advertencia] Al comando en ${filePath} le falta la propiedad 'data' o 'execute' requerida.`);
        };
    }
}

// Evento que ejecuta el código cuando el cliente reciba una interacción 
client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const command = interaction.client.commands.get(interaction.commandName);

    if (!command) {
        console.error(`No se encontró ningún comando que coincida con ${interaction.commandName}`);
        return;
    }
    
    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content: 'Hubo un error mientras se ejecutaba el comando', ephemeral: true });
        } else {
            await interaction.reply({ content: 'Hubo un error mientras se ejecutaba el comando', ephemeral: true });
        }
    }
});

// Cuando el cliente (bot) esté listo, se ejecuta este código sólo una vez (once).
// Imprime en la consola un mensaje avisando que el cliente está listo para operar y conectado correctamente a Discord.
client.once(Events.ClientReady, readyClient => {
    console.log(`Conectado a Discord y listo para operar, soy ${readyClient.user.username}`);
});

// Incia sesión en Discord con el token del client
client.login(token);