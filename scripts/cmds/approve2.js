const fs = require('fs');
const threadsFile = 'threadApproved.json';

module.exports = {
  config: {
    name: "approve2",
    aliases: ["ap"],
    version: "2.0",
    role: 2,
    author: "Rômeo",
    cooldown: 1,
    longDescription: {
      en: "See and manage the list of approved groups.",
    },
    category: "owner",
    guide: {
      en: "{pn} add/delete/list/deleteall/find [threadID]",
    }
  },
  onStart: async function ({ message, args, threadsData }) {
    if (args.length < 1) {
      message.reply(`⚠️ | You must provide an action: "add", "delete", "list", "deleteall", or "find"`);
      return;
    }

    const action = args[0].toLowerCase();
    const threadID = args[1];

    try {
      let threads = JSON.parse(fs.readFileSync(threadsFile));

      if (["-a", "a", "add"].includes(action)) args[0] = "add";
      if (["-d", "d", "delete", "remove"].includes(action)) args[0] = "remove";
      if (["-l", "list", "l"].includes(action)) args[0] = "list";
      if (["-da", "da", "deleteall"].includes(action)) args[0] = "deleteall";
      if (["f", "find","-f"].includes(action)) args[0] = "find";

      if (args[0] === "add" || args[0] === "remove") {
        if (!threadID) {
          return message.reply("⚠️ | You must provide a thread ID.");
        }

        const threadData = await threadsData.get(threadID);
        if (!threadData) {
          return message.reply("⚠️ | Invalid thread ID. Please provide a valid thread ID.");
        }

        if (args[0] === "add") {
          if (threads.includes(threadID)) {
            return message.reply(`Group ➟ ${threadData.threadName}\n\nTID ➟  ${threadID} \n\nis already approved.`);
          }

          threads.push(threadID);
          fs.writeFileSync(threadsFile, JSON.stringify(threads, null, 2));

          message.reply(`Group ➟ ${threadData.threadName}\n\nTID ➟  ${threadID} \n\nhas been approved.`);
        } else if (args[0] === "remove") {
          const index = threads.indexOf(threadID);
          if (index === -1) {
            return message.reply(`Group ➟ ${threadData.threadName}\n\nTID ➟  ${threadID} \n\n  is not approved.`);
          }

          threads.splice(index, 1);
          fs.writeFileSync(threadsFile, JSON.stringify(threads, null, 2));

          message.reply(`Group ➟ ${threadData.threadName}\n\nTID ➟  ${threadID} \n\nhas been disapproved.`);
        }
      } else if (args[0] === "list") {
        let threadList = "";
        for (let i = 0; i < threads.length; i++) {
          const threadData = await threadsData.get(threads[i]);
          const name = threadData ? threadData.threadName : "Unknown";
          threadList += `${i + 1} 〉${name}\n    TID - ${threads[i]}\n\n`;
        }

        if (threadList === "") {
          message.reply("❎ | No Groups Approved.");
        } else {
          message.reply(`${threadList}\n\nUse !approved -a/-d/-l/-da/-find and provide a specific tid to approve, disapprove, list, delete all, or find groups.`);
        }
      } else if (args[0] === "deleteall") {
        fs.writeFileSync(threadsFile, JSON.stringify([], null, 2));
        message.reply("All approved groups have been disapproved.");
      } else if (args[0] === "find") {
        if (!threadID) {
          return message.reply("⚠️ | You must provide a thread ID to find its approval status.");
        }

        const isApproved = threads.includes(threadID);

        const threadData = await threadsData.get(threadID);
        if (!threadData) {
          return message.reply("⚠️ | Invalid thread ID. Please provide a valid thread ID.");
        }

        if (isApproved) {
          message.reply(`Group ➟ ${threadData.threadName}\n\nTID ➟ ${threadID}\n\nis approved.`);
        } else {
          message.reply(`Group ➟ ${threadData.threadName}\n\nTID ➟ ${threadID}\n\nis not approved.`);
        }
      } else {
        return message.reply("⚠️ | Invalid action. Please use 'add, 'delete', 'list', 'deleteall', or 'find'.");
      }
    } catch (error) {
      console.error(error);
      message.reply("❌ | An error occurred while processing the action. Please try again later.");
    }
  }
};