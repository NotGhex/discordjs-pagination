///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Dependencies //////////////////////////////////////////////////////////////////////////////////////////////////////////
const {
   Interaction,
   Message,
   MessageEmbed,
   MessageButton
 } = require("discord.js");
const InteractionPagination = require('./lib/interaction');
const MessagePagination = require('./lib/message');
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Params ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * @param {Message} message - Discord.js interface
 * @param {Interaction} interaction - Discord.js interface
 * @param {MessageEmbed[]} pageList - An array of the embeds
 * @param {MessageButton[]} buttonList - An array of the buttons
 * @param {Number} timeout - How long the timeout lasts
 * @param {Boolean} replyMessage - If replyMessage is enabled
 * @param {Boolean} autoDelete - If autoDelete is enabled
 * @param {Boolean} privateReply - If privateReply is enabled
 * @param {Boolean} progressBar - ProgressBar settings
 * @param {String} proSlider - The symbol used to symbolise position on the progressBar
 * @param {String} proBar - The symbol used to symbolise pages to go on the progressBar
 * @param {Boolean} authorIndependent - Only the author can use pagination
 * @returns {MessageEmbed[]} The pagination
*/
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// pagination ///////////////////////////////////////////////////////////////////////////////////////////////////////////
module.exports = pagination = async({
   interaction, message, pages, pageList, buttonList,
   timeout = 12000,
   replyMessage = false,
   autoDelete = false,
   privateReply = false,
   progressBar = false,
   proSlider = "▣",
   proBar = "▢",
   authorIndependent = true
}) => {   
   // deprecated pages
   if (!pageList && typeof pages === "object") {
      process.emitWarning(`pages reference deprecated, replace pages with pageList`);
      pageList = pages;
   }
   // Checks
   if (message === undefined && interaction === undefined) throw new Error("Please provide either interaction or message for the pagination to use");
   if (!pageList) throw new Error("Missing pages");
   if (!buttonList) throw new Error("Missing buttons");
   if (timeout < 1000) throw new Error("You have set timeout less then 1000ms which is not allowed");
   if (proSlider.length > 1) throw new Error("You can only use 1 character to represent the progressBar slider");
   if (proBar.length > 1) throw new Error("You can only use 1 character to the progressBar");
   if (buttonList.length < 2) throw new Error("Need provide at least 2 buttons");
   if (buttonList.length > 5) {
      process.emitWarning("More than 5 buttons have been provided the extras will be removed, remove the extra buttons from the buttonList to stop getting this message");
      buttonList = buttonList.slice(0, 5);
   }
   for (const button of buttonList) {if (button.style === "LINK") throw new Error("Link buttons are not supported please check what type of buttons you are using")}
   // Message
   if (typeof message?.author === "object") {
      // Checks
      if (!message && !message.channel) throw new Error("Channel is inaccessible");
      if (pageList.length < 2) return replyMessage ? message.reply({embeds: [pageList[0]]}) : message.channel.send({embeds: [pageList[0]]});
      if (replyMessage && privateReply) process.emitWarning("The privateReply setting overwrites and disables replyMessage setting");
      // Run
      return MessagePagination(message, pageList, buttonList, timeout, replyMessage, autoDelete, privateReply, progressBar, proSlider, proBar, authorIndependent);
   }
   // Interaction
   // Checks
   if (pageList.length < 2) {
      if (interaction.deferred) {
         return interaction.editReply({embeds: [pageList[0]]});
      } else {
         return interaction.reply({embeds: [pageList[0]]});
      }
   }
   if (interaction === undefined) throw new Error("Please provide either interaction of message for pagination to use");
   if (interaction.ephemeral && buttonList.length === 3 || interaction.ephemeral && buttonList.length === 5) throw new Error("Delete buttons are not supported by embeds with ephemeral enabled");
   if (interaction.ephemeral && autoDelete) throw new Error("Auto delete is not supported by embeds with ephemeral enabled");
   // Run
   return InteractionPagination(interaction, pageList, buttonList, timeout, autoDelete, privateReply, progressBar, proSlider, proBar, authorIndependent);
}