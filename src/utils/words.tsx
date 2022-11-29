const importAll = (r: any) => {
	return r.keys().map(r)
}

let WordsData: any[] = []
const wordsData = importAll(require.context('/static/words', false, /\.(json)$/));
wordsData.forEach((r: any) => {
		Array.prototype.push.apply(WordsData, r);
	}
)

export default WordsData
