const config = require("../config.js");
const db = require("../mongoDB");
const os = require('os');
module.exports = {
  name: "about",
  description: "Информация о боте",
  options: [],
  permissions: "0x0000000000000800",
  run: async (client, interaction) => {
    let lang = await db?.musicbot?.findOne({ guildID: interaction.guild.id }).catch(e => {})
    lang = lang?.language || client.language
    lang = require(`../languages/${lang}.js`);
    try {
      const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle  } = require("discord.js")
      let totalGuilds
      let totalMembers
      let totalChannels
      let shardSize
      let voiceConnections
      if(config.shardManager.shardStatus == true){
      const promises = [
        client.shard.fetchClientValues('guilds.cache.size'),
        client.shard.broadcastEval(c => c.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0)),
        client.shard.broadcastEval(c => c.guilds.cache.reduce((acc, guild) => acc + guild.channels.cache.size, 0)),
        client.shard.broadcastEval(c => c.voice?.adapters?.size || 0)
      ];
      await Promise.all(promises)
			.then(results => {
				 totalGuilds = results[0].reduce((acc, guildCount) => acc + guildCount, 0);
				 totalMembers = results[1].reduce((acc, memberCount) => acc + memberCount, 0);
         totalChannels = results[2].reduce((acc, channelCount) => acc + channelCount, 0);
         shardSize = client.shard.count;
          voiceConnections = results[3].reduce((acc, voiceCount) => acc + voiceCount, 0);
      })
    } else {
      totalGuilds = client.guilds.cache.size
      totalMembers = client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0);
      totalChannels = client.guilds.cache.reduce((acc, guild) => acc + guild.channels.cache.size, 0);
      shardSize = 1;
      voiceConnections = client?.voice?.adapters?.size || 0;
    }
    function getCpuLoad() {
      const cpuCount = os.cpus().length;
      const load = os.loadavg()[0] / cpuCount;
      return `${load.toFixed(2)} %`;
    }
    const start = Date.now();
    interaction.deferReply({}).then(() => {
      const end = Date.now();
      const embed = new EmbedBuilder()
        .setTitle(lang.msg19)
        .setDescription(`**Бот запущен: <t:${Math.floor(Number(Date.now() - client.uptime) / 1000)}:R>**`)
        .setThumbnail(client.user.displayAvatarURL({ dynamic: true, size: 1024 }))
        .addFields({name: 'Пользователей:', value: `\`\`\`js
${totalMembers || 0}\`\`\``, inline: true})
        .addFields({name: 'Серверов:', value: `\`\`\`js
${totalGuilds || 0}\`\`\``, inline: true})
        .addFields({name: 'Каналов:', value: `\`\`\`js
${totalChannels || 0}\`\`\``, inline: true})
        .addFields({name: 'Активно каналов:', value: `\`\`\`js
${voiceConnections}\`\`\``, inline: true})
        .addFields({name: 'API Задержка:', value: `\`\`\`js
${client.ws.ping} ms\`\`\``, inline: true})
        .addFields({name: 'Задержка:', value: `\`\`\`js
${Date.now() - start} ms\`\`\``, inline: true})
        .addFields({name: 'Память:', value: `\`\`\`js
${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} %\`\`\``, inline: true})
        .addFields({name: 'Шардов:', value: `\`\`\`js
${shardSize || 0}\`\`\``, inline: true})
        .addFields({name: 'Библиотека:', value: `\`\`\`js
Discord.js\`\`\``, inline: true})
        .addFields({name: 'Версия бота:', value: `\`\`\`js
2024.2.8\`\`\``, inline: true})
        .addFields({name: 'Платформа:', value: `\`\`\`js
${process.platform}\`\`\``, inline: true})
        .addFields({name: 'Цпу:', value: `\`\`\`js
${getCpuLoad()}\`\`\``, inline: true})
        .addFields({name: 'Разработчик:', value: `\`\`\`js
@nixsaro, @thesnoy\`\`\``, inline: true})
        .setColor(client.config.embedColor)
        .setTimestamp()
        .setFooter({ text: `Amane` });
        const row = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setLabel('Сервер поддержки')
            .setURL('https://discord.gg/YVffXAMzxn')
            .setStyle(ButtonStyle.Link),
          new ButtonBuilder()
            .setLabel('Пригласить бота')
            .setURL('https://discord.com/oauth2/authorize?client_id=1052358464996900925&permissions=826784468296&scope=bot+applications.commands')
            .setStyle(ButtonStyle.Link)
        );
      return interaction.editReply({ embeds: [embed], components: [row]  }).catch(err => { });
      }).catch(err => {});
    
    } catch (e) {
      const errorNotifer = require("../functions.js")
     errorNotifer(client, interaction, e, lang)
      }
  },
};

