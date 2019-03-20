const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export const getDate = (ts) => {
	const date = new Date(ts)

	return `${months[date.getMonth()]} ${date.getDate()}`
}