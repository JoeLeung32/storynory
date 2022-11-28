import React, {SyntheticEvent, useState} from "react"
import {HeadFC, PageProps} from "gatsby"

interface Caption {
	start: number,
	end: number,
	content: string
}

interface LoopRange {
	start: number | null,
	end: number | null
}

const jsonData = require("./content.json")
const loopRangeDefault = {
	start: null,
	end: null
}

const StoryGreedyBear: React.FC<PageProps> = () => {
	const [audio, setAudio] = useState<HTMLAudioElement>()
	const [currentTime, setCurrentTime] = useState(0)
	const [loopRange, setLoopRange] = useState<LoopRange>(loopRangeDefault)
	const audioLoadedData = (event: SyntheticEvent) => {
		setAudio(event.target as HTMLAudioElement)
	}
	const timeLoopRange = {
		set: (start: number | null, end: number | null) => {
			setLoopRange({
				start: start,
				end: end
			})
			if (audio) {
				if (start) {
					audio.currentTime = start
				}
				audio.play()
			}
		},
		play: (start: number) => {
			setLoopRange({
				start: start,
				end: null
			})
			if (audio) {
				if (start) {
					audio.currentTime = start
				}
				audio.play()
			}
		},
		pause: () => {
			if (audio) {
				audio.pause()
			}
		},
		reset: () => {
			setLoopRange(loopRangeDefault)
			if (audio) {
				audio.play()
			}
		}
	}
	const timeUpdate = () => {
		if (audio) {
			setCurrentTime(audio.currentTime)
			if (loopRange) {
				if (loopRange.start && loopRange.start >= audio.currentTime) {
					audio.currentTime = loopRange.start || 0
				} else if (loopRange.end && loopRange.end <= audio.currentTime) {
					audio.currentTime = loopRange.start || 0
				}
			}
		}
	}
	return (
		<main>
			<h1>GreedyBear</h1>
			<div>
				<audio controls onTimeUpdate={timeUpdate} onLoadedData={audioLoadedData}>
					<source src={jsonData.sound} type={`audio/mp3`}/>
					Your browser does not support the audio element.
				</audio>
				<p>Current: {currentTime}</p>
				<p>Loop: {loopRange.start} / {loopRange.end}</p>
			</div>
			<div>
				{jsonData.captions.map((caption: Caption, idx: string) => {
					return (
						<div key={idx}>
							<button onClick={() => timeLoopRange.set(caption.start, caption.end)}>Loop</button>
							<button onClick={() => timeLoopRange.play(caption.start)}>Play</button>
							<button onClick={() => timeLoopRange.pause()}>Pause</button>
							<span>{caption.content}</span>
						</div>
					)
				})}
			</div>
		</main>
	)
}

export default StoryGreedyBear

export const Head: HeadFC = () => <title>Stories</title>
