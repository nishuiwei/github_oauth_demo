const express = require('express')
const axios = require('axios')
require('dotenv').config()

// 将变量结构出来
const { GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET, PORT } = process.env

const app = express()

const domain = 'http://localhost:8989/redirect_url'

app.get('/oauth', async (req, res) => {
	const url = `https://github.com/login/oauth/authorize/?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${domain}&scope=user&state=${Math.random()
		.toString(36)
		.slice(-6)}`
	res.redirect(url)
})

app.get('/redirect_url', async (req, res) => {
	const code = req.query.code
	const config = {
		client_id: GITHUB_CLIENT_ID,
		client_secret: GITHUB_CLIENT_SECRET,
		code,
		redirect_uri: domain,
	}
	const opts = { headers: { accept: 'application/json' } }

	const response = await axios.post(
		'https://github.com/login/oauth/access_token',
		{ ...config },
		opts
	)
	console.log(response.data)
	if (response.data) {
		const user = await axios.get('https://api.github.com/user', {
			headers: {
				Authorization: `Bearer ${response.data.access_token}`,
				Accept: 'application/vnd.github+json',
			},
		})
		console.log(user.data, ' =========> user')
	}
})

app.use('*', express.static(__dirname + '/static'))

const port = PORT || 5555
app.listen(port, () => {
	console.log(`服务已启动 http://127.0.0.1:${port}`)
})
