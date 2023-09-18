const Discord = require("discord.js");
const db = require("quick.db");

exports.run = async (client, message, args) => {


if(db.fetch(`bakimmod`)) {

  if(message.author.id !== "683752128644251660") return message.channel.send('```Şuanlık Discord Botumuz Bakımdadır Lütfen Bir Kaç Saat Sonra Tekrar Deneyiniz Veya ⚘ ! YUSUŦ ΞЛΞS ᵈᵃʳᵏ#0001 Bana Ulaşın```')

}

  if (!message.member.hasPermission("MANAGE_CHANNELS"))
    return message.channel.send(
      new Discord.MessageEmbed()
        .setColor("#ff0000")
        .addField(
          "Hata",
          `•\`=aç\`Kullanabilmek için , \`Kanalları Yönet\` **Yetkisine sahip olmanız gerekir**.`
        )
        .setImage(
          "https://cdn.discordapp.com/attachments/768502339375857714/768796763040907284/Ekran_Alnts.PNG"
        )
    );



  let every = message.guild.roles.cache.find(r => r.name === "@everyone");
  message.channel.createOverwrite(every, {
    SEND_MESSAGES: null
  });

 



  message.channel.send(
    "**Sohbet Kanalı `Yazılabilir` Durumuna Getirilmiştir.**"
  );
};

exports.conf = {
  enabled: true,
  guildOnly: false,
  aliases: ["sohbet-aç"],
  permLevel: 0
};

exports.help = {
  name: 's-aç',
  description: 'İstediğiniz kişiyi uyarır.',
  usage: 'aç'
};