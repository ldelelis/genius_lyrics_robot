import 'dotenv/config';
import Telegraf,  { Composer } from 'telegraf';
import * as geniusApi from 'genius-api';
import axios from 'axios';
import * as cheerio from 'cheerio';

const bot = new Telegraf(process.env.LYRICS_BOT_TOKEN);

bot.telegram.getMe().then((info) => {
  bot.options.username = info.username;
})

const lyricsBot = new Composer();
const apiClient = new geniusApi.default(process.env.LYRICS_BOT_API_TOKEN);

lyricsBot.hears(/\/letra ([\s\S]*)/i, async ({ reply, match }) => {
  const results = await apiClient.search(match[1]);
  const songs = results.hits.filter(res => res.type === 'song').map(res => res.result);
  if (songs.length === 0) {
    reply('no lyrics found booo');
    return;
  }
  const songUrl = songs[0].url;
  const song = await axios(songUrl);
  const $ = cheerio.load(song.data);
  const lyrics = $('.lyrics p').text().trim();
  reply(lyrics);
});
bot.use(lyricsBot);
bot.launch();