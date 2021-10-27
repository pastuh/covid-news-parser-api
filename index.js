const PORT = process.env.PORT || 8000;
const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();

// Sąrašas miestų kurių naujienos yra įdomios
const cities = [
	{
		name: 'Vilnius',
		title: 'vilnius'
	},
	{
		name: 'Kaunas',
		title: 'kaunas'
	},
	{
		name: 'Klaipėda',
		title: 'klaipeda'
	},
	{
		name: 'Šiauliai',
		title: 'siauliai'
	},
	{
		name: 'Panevėžys',
		title: 'panevezys'
	},
	{
		name: 'Alytus',
		title: 'alytus'
	},
	{
		name: 'Marijampolė',
		title: 'marijampole'
	},
	{
		name: 'Utena',
		title: 'utena'
	},
	{
		name: 'Telšiai',
		title: 'telsiai'
	},
	{
		name: 'Tauragė',
		title: 'taurage'
	},
	{
		name: 'Palanga',
		title: 'palanga'
	}];

// Sąrašas naujienų portalų
const newspapers = [
	{
		address: 'https://www.delfi.lt/miestai/',
		base: ''
	},
	{
		address: 'https://www.tv3.lt/gaires/',
		base: 'https://www.tv3.lt'
	},
	{
		address: 'https://ltdiena.lt/tag/',
		base: ''
	},
	{
		address: 'https://www.respublika.lt/lt/naujienos/raktazodis/?r=',
		base: 'https://www.respublika.lt'
	},
	{
		address: 'https://www.lrt.lt/tema/',
		base: 'https://www.lrt.lt'
	}
];

// -- PAIEŠKOS ŽODIS (jeigu randamas žodis, tuomet naujiena bus rodoma)
const searchWord = 'COVID';
// Talpinamos naujienos
const articles = [];

cities.forEach(city => {
	newspapers.forEach(newspaper => {
		/* TEST */
		// if(newspaper.address.includes('delfi')) {
		// 	parseNews(city, newspaper);
		// }

		parseNews(city, newspaper);
	})
})

function parseNews(city, newspaper) {
	// Generuojamas URL iš portalo adreso ir miestų sąrašo
	let url = newspaper.address + city.title;

	axios.get(url)
		.then(response => {
			const html = response.data;
			const $ = cheerio.load(html);

			// Suradus nuorodą su minėtu tekstu/žodžiu apdorojamas HTML
			$(`a:contains(${searchWord})`, html).each(function () {
				const title = $(this).text().trim();
				const url = $(this).attr('href');

				// Pagal nutylėjimą pašalinami įrašai kuriuose naudojami TAG (nereikalingas brukalas)
				if(!url.includes('/tag')) {

					// Naujienos pavadinimas unikalus (jeigu kartojasi pridedamas tik miestas)
					if (articles.some(e => e.title === title)) {
						let index = articles.findIndex(article => article.title === title);

						if(!articles[index].source.includes(city.name)) {
							articles[index].source.push(city.name);
							// console.log(`~LOADING~`);
						}

					} else {
						articles.push({
							title,
							url: newspaper.base + url,
							source: [city.name]
						})
					}

				}
			})
		})
		.catch(error => {
			console.log(error);
		})
}

app.get('/news', (req, res) => {
	res.json(articles);
})

app.get('/', (req,res) => {
	res.json('Welcome to COVID News checker (LITHUANIA)');
})

app.listen(PORT, () => {
	console.log(`Server running on ${PORT}`);
})
