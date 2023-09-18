const Discord = require('discord.js');//Bu Altyapı yDarKDayS Tarafından Yapılmıştır https://www.youtube.com/c/yDarKDayS
const db = require('quick.db');

exports.run = async (client, message, args) => { 

if(db.fetch(`bakimmod`)) {

  if(message.author.id !== "683752128644251660") return message.channel.send('```Şuanlık Discord Botumuz Bakımdadır Lütfen Bir Kaç Saat Sonra Tekrar Deneyiniz Veya ⚘ ! YUSUŦ ΞЛΞS ᵈᵃʳᵏ#0001 Bana Ulaşın```')

}

  let prefix = (await db.fetch(`prefix_${message.guild.id}`)) || "da!";//Bu Altyapı yDarKDayS Tarafından Yapılmıştır https://www.youtube.com/c/yDarKDayS
  const embed = new Discord.MessageEmbed()

let yardım = new Discord.MessageEmbed()  
.setColor('#e7000e')
.addField('yDarKDayS Moderasyon Yardım Menüsü',`

🤬 **${prefix}küfürengel** : Sunucunuzda Küfür Yasaklar
>> **${prefix}reklam-engel** : Sunucunuzda Reklam Yasaklar
>> **${prefix}napimengel** : Sunucunuzda Napim Diyemezler
>> **${prefix}ban** : Etiketlediğiniz Kullancıyı Sunucudan Yasaklar
>> **${prefix}prefix** : Prefix Değiştirir
>> **${prefix}istatistik** : Botun Ne Durumda Oldugunu Görürsünüz.
>> **${prefix}bakım** : Botu Bakıma Alırsınız (Sadece bot sahibi kullanabilir)
>> **${prefix}sil** : Mesaj silersiniz (max 300)
>> **${prefix}temizle** : Mesaj silersiniz (max 300)
>> **${prefix}sohbet-aç** : Sohbeti açarsınız
>> **${prefix}sohbet-kapat** : Sohbeti kapatırsınız
>> **${prefix}patlat** : Kanalı havaya uçurursunuz
>> **${prefix}davet** : Botumu Davet Edersiniz :)
==========ABONE ROL===========
>> **| ${prefix}abone-yetkili-rol |** : Abone Yetkilisini Seçer.

>> **| ${prefix}abone-rol |** : Vericeğiniz Rolü ayarlarsınız.

>> **| ${prefix}abone-log |** : Log mesajınn gitceği yer seçilir.

`)
  .addField("**» Davet Linki**", " [Botu Davet Et](https://discord.com/oauth2/authorize?client_id=767317246119903243&scope=bot&permissions=805314622) - [Destek Sunucumuz](https://discord.gg/tDpq2SAEF4)", )
    .setImage("https://media.discordapp.net/attachments/753161866787684369/850657074659983360/standard.gif")
.setFooter(`${message.author.tag} Tarafından İstendi.`, message.author.avatarURL())
.setThumbnail(client.user.avatarURL())
 message.channel.send(yardım) 
  };
//Bu Altyapı yDarKDayS Tarafından Yapılmıştır https://www.youtube.com/c/yDarKDayS
exports.conf = {
  enabled: true,
  guildOnly: false,
  aliases: ['help','yardım'],
  permLevel: 0
};

exports.help = {
  name: "moderasyon",
  category: "moderasyon-yardım",
    description: "Moderasyon Komutları Gösterir."
};//Bu Altyapı yDarKDayS Tarafından Yapılmıştır https://www.youtube.com/c/yDarKDayS