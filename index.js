const { Client, GatewayIntentBits } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus, StreamType } = require('@discordjs/voice');
const googleTTS = require('google-tts-api');
const http = require('http');

// 1. Serveur HTTP pour maintenir le bot éveillé sur les services cloud
http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Bot Discord actif.');
}).listen(process.env.PORT || 3000);

// 2. Initialisation du client Discord avec les permissions nécessaires
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates
    ]
});

const PREFIX = "!";

client.once('ready', () => {
    console.log(`🤖 Robot connecté sous le tag ${client.user.tag} !`);
});

// 3. Logique de commande TTS
client.on('messageCreate', async message => {
    if (message.author.bot || !message.content.startsWith(PREFIX)) return;

    const args = message.content.slice(PREFIX.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    if (command === 'dis') {
        const texteA_Dire = args.join(' ');

        if (!texteA_Dire) return message.reply("Tu dois écrire un message !");

        const voiceChannel = message.member.voice.channel;
        if (!voiceChannel) return message.reply("Tu dois d'abord rejoindre un salon vocal !");

        try {
            // Génération de l'URL TTS depuis Google
            const url = googleTTS.getAudioUrl(texteA_Dire, {
                lang: 'fr',
                slow: false,
                host: 'https://translate.google.com',
            });

            // Connexion au salon vocal
            const connection = joinVoiceChannel({
                channelId: voiceChannel.id,
                guildId: voiceChannel.guild.id,
                adapterCreator: voiceChannel.guild.voiceAdapterCreator,
            });

            const player = createAudioPlayer();
            
            // Préparation de la ressource audio
            const resource = createAudioResource(url, {
                inputType: StreamType.Arbitrary
            });

            player.play(resource);
            connection.subscribe(player);

            // Gestion de la fin de lecture : déconnexion automatique
            player.on(AudioPlayerStatus.Idle, () => {
                setTimeout(() => {
                    try {
                        connection.destroy();
                    } catch (e) {
                        console.error("Erreur lors de la déconnexion :", e);
                    }
                }, 1000);
            });

            // Gestion des erreurs du lecteur pour éviter que le bot ne plante
            player.on('error', (error) => {
                console.error('Erreur AudioPlayer:', error);
                connection.destroy();
            });

            await message.react('🤖');

        } catch (error) {
            console.error('Erreur lors de la génération TTS :', error);
            message.reply("Une erreur est survenue lors de la lecture du texte.");
        }
    }
});

// Connexion avec la variable d'environnement (sécurité)
client.login(process.env.DISCORD_TOKEN);
