import React, { SyntheticEvent, useState } from 'react'
import { HeadFC, PageProps } from 'gatsby'
import styled from 'styled-components'
import ScriptBuilder from '../../../components/scriptBuilder/ScriptBuilder'

interface CaptionData {
    start: number
    end: number
    content: string
    standalone?: boolean
}

interface Caption {
    type: 'paragraph'
    data: [CaptionData]
}

interface LoopRange {
    start: number | null
    end: number | null
}

const loopRangeDefault = {
    start: null,
    end: null,
}

const jsonData = require('./content.json')

const StyledParagraph = styled.div`
    display: block;
    margin-bottom: 1rem;
`

interface StyledParagraphLine {
    standalone?: boolean
}

const StyledParagraphLine = styled.div<StyledParagraphLine>`
    display: inline-flex;
    ${(props) => (props.standalone ? 'width: 100%' : 'flex: 1')};
    &[data-highlight='true'] {
        > div {
            background: #ffff8d;
        }
    }
    > div {
        align-items: center;
        border-radius: 1rem;
    }
`
const StyledButtonGroup = styled.div`
    white-space: nowrap;
`

const StoryGreedyBear: React.FC<PageProps> = () => {
    const [audio, setAudio] = useState<HTMLAudioElement>()
    const [currentTime, setCurrentTime] = useState(0)
    const [loopRange, setLoopRange] = useState<LoopRange>(loopRangeDefault)
    const audioLoadedData = (event: SyntheticEvent) => {
        setAudio(event.target as HTMLAudioElement)
    }
    const audioControl = {
        play: (start: number | null) => {
            if (audio) {
                if (start !== null) audio.currentTime = start
                audio.play()
            }
        },
        pause: () => {
            if (audio) audio.pause()
        },
    }
    const timeLoopRange = {
        set: (start: number | null, end: number | null) => {
            setLoopRange({
                start: start,
                end: end,
            })
            audioControl.play(start)
        },
        play: (start: number) => {
            setLoopRange({
                start: start,
                end: null,
            })
            audioControl.play(start)
        },
    }
    const timeUpdate = () => {
        if (audio) {
            setCurrentTime(audio.currentTime)
            if (loopRange) {
                if (loopRange.start && loopRange.start >= audio.currentTime) {
                    audio.currentTime = loopRange.start || 0
                } else if (
                    loopRange.end &&
                    loopRange.end <= audio.currentTime
                ) {
                    audio.currentTime = loopRange.start || 0
                }
            }
            if (document) {
                const paragraphs = document.querySelectorAll('.storyParagraph')
                if (paragraphs) {
                    paragraphs.forEach((el) => {
                        if (el instanceof HTMLElement) {
                            const timeFrom = Number(el?.dataset.start) || 0
                            const timeTo = Number(el?.dataset.end) || 0
                            const targeted =
                                audio.currentTime >= timeFrom &&
                                audio.currentTime < timeTo
                            el.dataset.highlight = targeted ? 'true' : 'false'
                            if (targeted) {
                                el.scrollIntoView({
                                    behavior: 'smooth',
                                    block: 'center',
                                    inline: 'nearest',
                                })
                            }
                        }
                    })
                }
            }
        }
    }
    const parser = {
        paragraph: (data: [CaptionData]) => {
            return data.map((line, idx) => (
                <StyledParagraphLine
                    key={idx}
                    standalone={line.standalone}
                    className={`storyParagraph m-0 py-3 py-md-0`}
                    data-start={line.start}
                    data-end={line.end}
                >
                    <div className={`p-2 px-3`}>
                        <div className={`text-muted`}>
                            <small>xxx</small>
                        </div>
                        <div>
                            <span>{line.content}</span>
                        </div>
                        <StyledButtonGroup>
                            <button
                                className={`btn btn-sm btn-link`}
                                onClick={() =>
                                    timeLoopRange.set(line.start, line.end)
                                }
                            >
                                <i className="fa-solid fa-repeat"></i>
                            </button>
                            <button
                                className={`btn btn-sm btn-link`}
                                onClick={() => timeLoopRange.play(line.start)}
                            >
                                <i className="fa-solid fa-play"></i>
                            </button>
                            <button
                                className={`btn btn-sm btn-link`}
                                onClick={() => audio?.pause()}
                            >
                                <i className="fa-solid fa-pause"></i>
                            </button>
                        </StyledButtonGroup>
                    </div>
                </StyledParagraphLine>
            ))
        },
    }
    return (
        <main className={`container-fluid`}>
            <h1>GreedyBear</h1>
            <div>
                <audio
                    controls
                    onTimeUpdate={timeUpdate}
                    onLoadedData={audioLoadedData}
                >
                    <source src={jsonData.sound} type={`audio/mp3`} />
                    Your browser does not support the audio element.
                </audio>
                <p>Current: {currentTime}</p>
                <p>
                    Loop: {loopRange.start} / {loopRange.end}
                </p>
            </div>
            <div>
                {jsonData.captions.map((caption: Caption, idx: string) => {
                    return (
                        <React.Fragment key={idx}>
                            {caption.type === 'paragraph' && (
                                <StyledParagraph>
                                    {parser.paragraph(caption.data)}
                                </StyledParagraph>
                            )}
                        </React.Fragment>
                    )
                })}
            </div>
            <ScriptBuilder
                audio={audio}
                storyPath={`/stories/greedyBear/story.txt`}
            />
        </main>
    )
}

export default StoryGreedyBear

export const Head: HeadFC = () => <title>Stories</title>
