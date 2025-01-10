const fs = require("fs");
const approvedDataPath = "threadApproved.json";

module.exports = {
  config: {
    name: "approve",
    aliases: ["app"],
    author: "ArYAN", //don't change my credit
    countDown: 0,
    role: 2,
    category: "admin",
    shortDescription: {
      en: "Approve Unapproved Groups Chats",
    },
  },

  onLoad: async function () {
    if (!fs.existsSync(approvedDataPath)) {
      fs.writeFileSync(approvedDataPath, JSON.stringify([]));
    }
  },

  onStart: async function ({ event, api, args }) {
    const { threadID, messageID, senderID } = event;
    const command = args[0] || "";
    const idToApprove = args[1] || threadID;

    let approvedData = JSON.parse(fs.readFileSync(approvedDataPath));

    if (command === "list") {
      let msg = "🔎 𝗔𝗽𝗽𝗿𝗼𝘃𝗲 𝗟𝗶𝘀𝘁\n━━━━━━━━━━\n\nHere Is approved groups list\n";
      for (let index = 0; index < approvedData.length; index++) {
        const groupId = approvedData[index];
        const threadInfo = await api.getThreadInfo(groupId);
const groupName = threadInfo ? (threadInfo.name || "Unnamed Group") : "Unnamed Group";
        msg += `━━━━━━━[ ${index + 1} ]━━━━━━━\nℹ𝗡𝗮𝗺𝗲➤ ${groupName}\n🆔 𝗜𝗗➤ ${groupId}\n`;
      }
      api.sendMessage(msg, threadID, messageID);
    } else if (command === "del") {
      if (!isNumeric(idToApprove)) {
        api.sendMessage("⛔|𝗜𝗻𝘃𝗮𝗹𝗶𝗱 𝗜𝗗\n━━━━━━━━━━\n\nInvalid number or tid please check your group number.", threadID, messageID);
        return;
      }

      if (!approvedData.includes(idToApprove)) {
        api.sendMessage(
          "⛔|𝗡𝗼 𝗗𝗮𝘁𝗮\n━━━━━━━━━━\n\nThe group was not approved before!",
          threadID,
          messageID
        );
        return;
      }

      approvedData = approvedData.filter((e) => e !== idToApprove);
      fs.writeFileSync(approvedDataPath, JSON.stringify(approvedData, null, 2));

      const threadInfo = await api.getThreadInfo(idToApprove);
      const groupName = threadInfo.name || "Unnamed Group";

      api.sendMessage(
        `✅|𝗥𝗲𝗺𝗼𝘃𝗲𝗱\n\nGroup has been removed from the approval list. \n🍁 | Group: ${groupName}\n🆔 | TID: ${idToApprove}`,
        threadID,
        messageID
      );
    } else if (!isNumeric(idToApprove)) {
      api.sendMessage("⛔|𝗜𝗻𝘃𝗮𝗹𝗶𝗱 𝗜𝗗\n━━━━━━━━━━\n\nInvalid Group UID please check your group uid", threadID, messageID);
    } else if (approvedData.includes(idToApprove)) {
      api.sendMessage(
        `✅|𝗔𝗹𝗿𝗲𝗮𝗱𝘆 𝗔𝗽𝗽𝗿𝗼𝘃𝗲𝗱\n\n🍁Group | TID: ${idToApprove} was already approved! `,
        threadID,
        messageID
      );
    } else {
      // Approve the group
      approvedData.push(idToApprove);
      fs.writeFileSync(approvedDataPath, JSON.stringify(approvedData, null, 2));

      // Send approval message to the group
      const userName = api.getUserInfo(senderID).name;
      const userID = event.senderID;
       const threadInfo = await api.getThreadInfo(idToApprove);
      const groupName = threadInfo.name || "Unnamed Group";
      const userFbLink = `https://www.facebook.com/${userID}`;
      const approvalTime = new Date().toLocaleTimeString();
      const approvalDate = new Date().toLocaleDateString();
      const approvalCount = approvedData.length;

      const approvalMessage = `✅|𝗔𝗽𝗽𝗿𝗼𝘃𝗲𝗱\n━━━━━━━━━━\n\nYour group has been approved by ${userName}\n🔎 𝗔𝗰𝘁𝗶𝗼𝗻 𝗜𝗗 ${userID}\n🖇 𝗙𝗕 𝗟𝗶𝗻𝗸: ${userFbLink}\n🗓 𝗔𝗽𝗽𝗿𝗼𝘃𝗲𝗧𝗶𝗺𝗲: ${approvalTime}/${approvalDate}\n\nℹ 𝗔𝗽𝗽𝗿𝗼𝘃𝗲𝗱 𝗗𝗮𝘁𝗮: ${approvalCount}`;

      api.sendMessage(approvalMessage, idToApprove);
      api.sendMessage(`✅|𝗔𝗽𝗽𝗿𝗼𝘃𝗲𝗱\n━━━━━━━━━━\n\nGroup has been approved successful:\n🍁 | Group: ${groupName}\n🆔 | TID: ${idToApprove}`, threadID, messageID);
    }
  },
};

function isNumeric(value) {
  return /^-?\d+$/.test(value);
}