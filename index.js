const express = require('express')
const axios = require('axios').default
const cheerio = require('cheerio')
const app = express()
const port = 3000

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.get('/species', async (req, res) => {
    const response = await axios.get('https://en.wikipedia.org/wiki/List_of_freshwater_aquarium_fish_species')
    const html = response.data
    const $ = cheerio.load(html)
    const rows = $('table.sortable tbody tr')
    const fish =[];
    rows.each(function (idx, el) {
        const tds = Array.from($('td', el));
        const fishData = {
            name: '',
            taxonomy: '',
            about: '',
            imageURL: '',
            size: '',
            remarks: '',
            temprange: '',
            phRange: '',
            detailsUrl: ''
        };
        fishData.name = $(tds[0]).text();
        fishData.taxonomy = $(tds[1]).text();
        fishData.about = $(tds[2]).text();
        let thumbURL = $(tds).find('img').attr('src');
        if(thumbURL) {
          thumbURL = `https:${thumbURL}`;
          let temp = new URL(thumbURL);
          const newURL = temp.pathname.split('/').filter(part => part !== 'thumb').slice(0, -1).join('/');
          fishData.imageURL = `${temp.protocol}//${temp.host}/${newURL}`;
        
        }
        fishData.size = $(tds[4]).text();
        fishData.remarks = $(tds[5]).text();
        fishData.temprange = $(tds[6]).text();
        fishData.phRange = $(tds[7]).text();
        const detailsHref = $(tds).find('a.mw-redirect').attr('href');
        fishData.detailsUrl = detailsHref ? `https://en.wikipedia.org/${$(tds).find('a.mw-redirect').attr('href')}`: '';

         if ( fishData.name !== '') {
          fish.push(fishData);
         }
    });
    res.json(fish);
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
