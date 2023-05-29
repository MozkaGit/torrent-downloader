const {si} = require('nyaapi')
const express = require('express');
const YGG = require('yggtorrent');
const parseTorrent = require('parse-torrent');
const Transmission = require('transmission')
const fs = require('fs');
const app = express();
const port = 3000;
var torrents;

const transmission = new Transmission({
  host: 'localhost',
  port: 9091,
});

const client = new YGG(
  'https://www3.yggtorrent.do',
  'http://localhost:9999',
  'vest95100',
  'U@Tk9FCTBN@ect@VMb!_'
);

app.get('/ygg', (req, res) => {
  const searchTerm = req.query.anime;
  (async () => {
    try {
      const search = await client.search({
        name: searchTerm,
        category: '2145',
        sub_category: '2179',
      });

      const donnee = [];
      for (let values of search.result) {
        donnee.push(`${values.torrent} | Size: ${values.size} | Seeders: ${values.s}`);
      }

      torrents = search.result;
      res.send(donnee);
    } catch (error) {
      console.log(error);
    }
  })();
});

app.get('/nyaa', (req, res) => {
    const anime = req.query.anime;
si.search({
  term: anime,
  n: 20,
  filter: 0,
})
  .then((data) => {
    donnee = []
    for (let values of data) {
        donnee.push(values.name + " | " + values.filesize + " | " + values.seeders)
    }
    console.log(donnee);
  torrents = data;
  //console.log(torrents);
  res.send(donnee);
  })
  .catch((err) => console.log(err))
});

app.get('/choice1', async (req, res) => {
  try {
    const number = req.query.number;
    if (!number || isNaN(number) || number < 0 || number > torrents.length) {
      throw new Error('Invalid number parameter');
    }
    const buf = await client.getTorrent(torrents[number-1].id);
    const torrent = parseTorrent(buf);
    const uri = parseTorrent.toMagnetURI({infoHash: torrent.infoHash});
    const ws = fs.createWriteStream('/mnt/Elements/Download/torrents/' + torrent.name + '.torrent');
    ws.write(buf);
    ws.end();
    console.log(torrent.name)
    transmission.addFile('/mnt/Elements/Download/torrents/' + torrent.name + '.torrent', (err, arg) => {
      if (err) {
        console.log(err);
        res.status(500).send(err.message);
      } else {
        res.send(torrents[number-1].id);
      }
    });
  } catch (error) {
    console.log(error);
    res.status(400).send(error.message);
  }
});

app.get('/choice2', (req, res) => {
const number = req.query.number;
res.send(torrents[number].magnet);
transmission.addUrl(torrents[number-1].magnet, function(err, arg){});

    });

app.listen(port, () => console.log(`Hello world app listening on port ${port}!`))