const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const dateString = (date) => `${months[date.getMonth()]}\u00a0${date.getDate()}`

export const getDate = (ts) => dateString(new Date(ts))

const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export const getWeekDate = (ts) => {
	const date = new Date(ts)

	return `${days[date.getDay()]},\u00a0${dateString(date)}`
}