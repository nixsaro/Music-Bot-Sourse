const { ApplicationCommandOptionType, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } = require('discord.js');
const db = require("../mongoDB");
module.exports = {
  name: "search",
  description: "Найти музыку.",
  permissions: "0x0000000000000800",
  options: [{
    name: 'name',
    description: 'Введите название музыки, которую хотите воспроизвести.',
    type: ApplicationCommandOptionType.String,
    required: true
  }],
  voiceChannel: true,
  run: async (client, interaction) => {
    let lang = await db?.musicbot?.findOne({ guildID: interaction.guild.id })
    lang = lang?.language || client.language
    lang = require(`../languages/${lang}.js`);

    try {

      const name = interaction.options.getString('name')
      if (!name) {
      const embed1 = new EmbedBuilder()
      .setDescription(lang.msg73)
      .setColor(client.config.errorColor);
      return interaction.reply({ embeds: [embed1], ephemeral: true }).catch(e => { })};
      let res

try {
      res = await client.player.search(name, {
        member: interaction.member,
        textChannel: interaction.channel,
        interaction
      })
    } catch(e){
      const embed = new EmbedBuilder()
      .setDescription(lang.msg60)
      .setColor(client.config.errorColor);
      return interaction.reply({ embeds: [embed] }).catch(e => { })

    }

      if (!res || !res.length || !res.length > 1){ 
      const embed = new EmbedBuilder()
      .setDescription(lang.msg74)
      .setColor(client.config.errorColor);
      return interaction.reply({ embeds: [embed], ephemeral: true }).catch(e => { })};

      const embed = new EmbedBuilder();
      embed.setColor(client.config.embedColor);
      embed.setTitle(`${lang.msg75} ${name}`);

      const maxTracks = res.slice(0, 10);

      let track_button_creator = maxTracks.map((song, index) => {
        return new ButtonBuilder()
          .setLabel(`${index + 1}`)
          .setStyle(ButtonStyle.Secondary)
          .setCustomId(`${index + 1}`)
      })

      let buttons1
      let buttons2
      if (track_button_creator.length > 10) {
        buttons1 = new ActionRowBuilder().addComponents(track_button_creator.slice(0, 5))
        buttons2 = new ActionRowBuilder().addComponents(track_button_creator.slice(5, 10))
      } else {
        if (track_button_creator.length > 5) {
          buttons1 = new ActionRowBuilder().addComponents(track_button_creator.slice(0, 5))
          buttons2 = new ActionRowBuilder().addComponents(track_button_creator.slice(5, Number(track_button_creator.length)))
        } else {
          buttons1 = new ActionRowBuilder().addComponents(track_button_creator)
        }
      }

      let cancel = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setLabel(lang.msg81)
          .setStyle(ButtonStyle.Danger)
          .setCustomId('cancel'))

      embed.setDescription(`${maxTracks.map((song, i) => `\`${i + 1}.\` \`${song.name} | [${song.formattedDuration}]\``).join('\n')}\n\n${lang.msg76.replace("{maxTracks.length}", maxTracks.length)}`);
      embed.setTimestamp();
      embed.setFooter({ text: `Ayoka` })

      let code
      if (buttons1 && buttons2) {
        code = { embeds: [embed], components: [buttons1, buttons2, cancel] }
      } else {
        code = { embeds: [embed], components: [buttons1, cancel] }
      }
      interaction.reply(code).then(async Message => {
        const filter = i => i.user.id === interaction.user.id
        let collector = await Message.createMessageComponentCollector({ filter, time: 60000 })


        collector.on('collect', async (button) => {
          switch (button.customId) {
            case 'cancel': {
              embed.setDescription(`${lang.msg77}`)
              await interaction.editReply({ embeds: [embed], components: [] }).catch(e => { })
              return collector.stop();
            }
              break;

            default: {
              embed.setDescription(`**${res[Number(button.customId) - 1].name}** ${lang.msg79}`)
              await interaction.editReply({ embeds: [embed], components: [] }).catch(e => { })
              try {
                await client.player.play(interaction.member.voice.channel, res[Number(button.customId) - 1].url, {
                  member: interaction.member,
                  textChannel: interaction.channel,
                  interaction
                })
              } catch (e) {
                let channel = interaction.member.voice.channel;
                if (!channel || !channel.permissionsFor(client.user).has(PermissionFlagsBits.ViewChannel)) {
                  return interaction.followUp({
                    embeds: [
                      new EmbedBuilder()
                        .setDescription(`К сожалению, я не могу обнаружить канал в котором вы находитесь!`)
                        .setColor(client.config.errorColor)
                    ],
                  });
                }

                if (!channel.permissionsFor(client.user).has(PermissionFlagsBits.Connect) || !channel.permissionsFor(client.user).has(PermissionFlagsBits.Speak)) {
                  return interaction.followUp({
                    embeds: [
                      new EmbedBuilder()
                        .setDescription('К сожалению, у меня недостаточно прав, для подключения к этому каналу!')
                        .setColor(client.config.errorColor)
                    ],
                  });
                }
                const embed = new EmbedBuilder()
                .setDescription(lang.msg60)
                .setColor(client.config.errorColor);
                return interaction.editReply({ embeds: [embed], ephemeral: true }).catch(e => { })
              }             
              return collector.stop();
            }
          }
        });

        collector.on('end', (msg, reason) => {


          if (reason === 'time') {
            embed.setDescription(lang.msg80)
            return interaction.editReply({ embeds: [embed], components: [] }).catch(e => { })
          }
        })

      }).catch(e => { })

    } catch (e) {
      const errorNotifer = require("../functions.js")
     errorNotifer(client, interaction, e, lang)
      }
  },
};
