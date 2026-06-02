const { Client, GatewayIntentBits } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus, StreamType } = require('@discordjs/voice');
const googleTTS = require('google-tts-api');

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
    console.log(`🤖 Robot connecté avec succès !`);
});

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
            const url = googleTTS.getAudioUrl(texteA_Dire, {
                lang: 'fr',
                slow: false,
                host: 'https://translate.google.com',
            });

            const connection = joinVoiceChannel({
                channelId: voiceChannel.id,
                guildId: voiceChannel.guild.id,
                adapterCreator: voiceChannel.guild.voiceAdapterCreator,
            });

            const player = createAudioPlayer();
            
            // Cette ligne force Discord à lire le flux audio directement sans buguer
            const resource = createAudioResource(url, {
                inputType: StreamType.Arbitrary
            });

            player.play(resource);
            connection.subscribe(player);

            player.on(AudioPlayerStatus.Idle, () => {
                setTimeout(() => connection.destroy(), 1000);
            });

            await message.react('🤖');

        } catch (error) {
            console.error(error);
            message.reply("Erreur de voix.");
        }
    }
});

// ⚠️ N'OUBLIE PAS DE METTRE TON TOKEN CI-DESSOUS
client.login(process.env.DISCORD_TOKEN);
