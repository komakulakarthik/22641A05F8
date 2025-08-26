const ENDPOINT = 'http://20.244.56.144/evaluation-service/logs'

const stacks = new Set(['backend', 'frontend'])
const levels = new Set(['debug', 'info', 'warn', 'error', 'fatal'])
const backendPkgs = new Set(['cache','controller','cron_job','db','domain','handler','repository','route','service'])
const frontendPkgs = new Set(['api'])
const sharedPkgs = new Set(['auth','config','middleware','utils','component','hook','page','state','style'])

function allowedPackages(stack) {
	if (stack === 'backend') return new Set([...backendPkgs, ...sharedPkgs])
	if (stack === 'frontend') return new Set([...frontendPkgs, ...sharedPkgs])
	return new Set()
}

function ensureValid({ stack, level, package: pkg, message }) {
	if (!stacks.has(stack)) throw new Error('invalid stack')
	if (!levels.has(level)) throw new Error('invalid level')
	if (!allowedPackages(stack).has(pkg)) throw new Error('invalid package')
	if (typeof message !== 'string' || !message.trim()) throw new Error('invalid message')
}

export default async function log(stack, level, pkg, message) {
	const payload = { stack: String(stack).toLowerCase(), level: String(level).toLowerCase(), package: String(pkg).toLowerCase(), message: String(message) }
	ensureValid(payload)
	const headers = { 'Content-Type': 'application/json' }
	const token = process.env.LOG_TOKEN
	if (token) headers['Authorization'] = `Bearer ${token}`
	const res = await fetch(ENDPOINT, { method: 'POST', headers, body: JSON.stringify(payload) })
	if (!res.ok) {
		const text = await res.text().catch(() => '')
		throw new Error(text || `request failed ${res.status}`)
	}
	return res.json().catch(() => ({}))
}

export { log as default, log }