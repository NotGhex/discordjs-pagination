///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Dependencies //////////////////////////////////////////////////////////////////////////////////////////////////////////
const {
  MessageActionRow,
  Message,
  MessageEmbed,
  MessageButton,
  Interaction,
} = require("discord.js");
const disabledButtons = require('../util/disabledButtons');
let page = 0;
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Params ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * @param {Interaction} interaction
 * @param {MessageEmbed[]} pages
 * @param {MessageButton[]} buttonList
 * @param {number} timeout
 * @returns
*/
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Interaction pagination ////////////////////////////////////////////////////////////////////////////////////////////////
module.exports = InteractionPagination = async (interaction, pages, buttonList, timeout) => {
  // Checks
  if (pages.length < 2) {
    if (interaction.deferred === true) {
      return interaction.editReply({embeds: [pages[page]]});
    } else {
      return interaction.reply({embeds: [pages[page]]});
    }
  }
  // Create embed
  const row = new MessageActionRow().addComponents(buttonList);
  let curPage
  if (interaction.deferred === true) {
    curPage = await interaction.editReply({
      embeds: [pages[page].setFooter(`Page ${page + 1} / ${pages.length}`)],
      components: [row],fetchReply: true,
    });
  } else {
    curPage = await interaction.reply({
      embeds: [pages[page].setFooter(`Page ${page + 1} / ${pages.length}`)],
      components: [row],fetchReply: true,
    });
  }
  // Create filter
  let filter 
  if (buttonList[2] === undefined) {
    filter = (i) =>
      i.customId === buttonList[0].customId ||
      i.customId === buttonList[1].customId;
  } else {
    filter = (i) =>
      i.customId === buttonList[0].customId ||
      i.customId === buttonList[1].customId ||
      i.customId === buttonList[2].customId;
  }
  // Create collector
  const collector = await curPage.createMessageComponentCollector({
    filter,
    time: timeout,
  });
  // Button inputs
  collector.on("collect", async (i) => {
    switch (i.customId) {
      case buttonList[0].customId:
        page = page > 0 ? --page : pages.length - 1;
        break;
      case buttonList[1].customId:
        page = page + 1 < pages.length ? ++page : 0;
        break;
      case buttonList[2].customId:
        curPage.delete();
        return;
      default:
        break;
    }
    await i.deferUpdate();
    await i.editReply({
      embeds: [pages[page].setFooter(`Page ${page + 1} / ${pages.length}`)],
      components: [row],
    });
    collector.resetTimer();
  });
  // Timeout or embed was deleted
  collector.on("end", async() => {
    try {
      await interaction.channel.messages.fetch(curPage.id);
      try {
        const disabledRow = await disabledButtons(buttonList);
        curPage.edit({
          embeds: [pages[page].setFooter(`Page ${page + 1} / ${pages.length}`)],
          components: [disabledRow],
        });
      } catch(error) {return}
    } catch(error) {return}
  });
  return curPage;
};