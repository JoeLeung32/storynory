import React, { SyntheticEvent, useState } from 'react'
import {
    Caption,
    CaptionLine,
    CaptionTimestamp,
    TypeAudioTimeFormat,
} from '../../interfaces/Caption'
import { StyledParagraph, StyledParagraphLine } from '../styled/StyledParagraph'

interface Props {
    audioSourceUrl: string
    handleAudio: any
    storyName: string
    captions: {
        map(element: (caption: Caption, idx: string) => JSX.Element): any
    }
    children: React.ReactElement | undefined
    translationCode?: any
}

const timeLoopDefault = {
    start: null,
    end: null,
}

const StoryBook: React.FC<Props> = (props) => {
    const { children } = props
    const { audioSourceUrl, handleAudio } = props
    const { storyName, captions, translationCode } = props
    const [highlighter, setHighlighter] = useState<boolean>(true)
    const [audio, setAudio] = useState<HTMLAudioElement>()
    const [currentTime, setCurrentTime] = useState(0)
    const [timeLoop, setTimeLoop] = useState<CaptionTimestamp>(timeLoopDefault)
    const [currentLineId, setCurrentLineId] = useState<string | null>(null)
    const audioLoadedData = (event: SyntheticEvent) => {
        handleAudio(event.target as HTMLAudioElement)
        setAudio(event.target as HTMLAudioElement)
    }
    const audioControl = {
        set: async (start: TypeAudioTimeFormat, end: TypeAudioTimeFormat) => {
            setTimeLoop({
                start: start,
                end: end,
            })
            await audioControl.play(start)
        },
        play: async (start: TypeAudioTimeFormat) => {
            if (!audio) return
            if (start !== null) audio.currentTime = start
            await audio.play()
        },
        pause: () => {
            if (!audio) return
            audio.pause()
        },
    }
    const handleTimeUpdate = () => {
        const doLooping = () => {
            if (!audio) return
            if (!timeLoop) return
            if (timeLoop.start && timeLoop.start >= audio.currentTime) {
                audio.currentTime = timeLoop.start || 0
            } else if (timeLoop.end && timeLoop.end <= audio.currentTime) {
                audio.currentTime = timeLoop.start || 0
            }
        }
        const doHighlightAndScroll = () => {
            if (!audio) return
            if (!document) return
            const paragraphs = document.querySelectorAll('.storyParagraph')
            if (!paragraphs) return
            setCurrentLineId(null)
            paragraphs.forEach((el) => {
                if (el instanceof HTMLElement) {
                    const targeted =
                        audio.currentTime >= Number(el?.dataset.start) &&
                        audio.currentTime < Number(el?.dataset.end)
                    el.dataset.highlight =
                        highlighter && targeted ? 'true' : 'false'
                    if (targeted) {
                        setCurrentLineId(el.id)
                        if (highlighter) {
                            el.scrollIntoView({
                                behavior: 'smooth',
                                block: 'center',
                                inline: 'nearest',
                            })
                        }
                    }
                }
            })
        }
        if (audio) setCurrentTime(audio.currentTime)
        doLooping()
        doHighlightAndScroll()
    }
    const parserParagraph = (data: [CaptionLine], parentId: string) => {
        return data.map((line, idx) => {
            const eleId = `${parentId}l${idx}`
            return (
                <StyledParagraphLine
                    key={idx}
                    standalone={line.standalone}
                    id={eleId}
                    className={`storyParagraph m-0 py-3 py-md-0`}
                    data-start={line.start}
                    data-end={line.end}
                >
                    <div className={`p-2 px-3`}>
                        <div className={`text-muted`}>
                            {translationCode &&
                                line.translation &&
                                line.translation[translationCode] && (
                                    <small>
                                        {line.translation[translationCode]}
                                    </small>
                                )}
                            {!line.translation && <small>...</small>}
                        </div>
                        <div>
                            <span>{line.content}</span>
                        </div>
                        <div>
                            <button
                                className={`btn btn-sm btn-link`}
                                onClick={() =>
                                    audioControl.set(line.start, line.end)
                                }
                            >
                                <i className="fa-solid fa-repeat"></i>
                            </button>
                            {eleId !== currentLineId && (
                                <button
                                    className={`btn btn-sm btn-link`}
                                    onClick={() =>
                                        audioControl.set(line.start, null)
                                    }
                                >
                                    <i className="fa-solid fa-play"></i>
                                </button>
                            )}
                            {eleId === currentLineId && (
                                <button
                                    className={`btn btn-sm btn-link`}
                                    onClick={() => audio?.pause()}
                                >
                                    <i className="fa-solid fa-pause"></i>
                                </button>
                            )}
                            <button
                                className={`btn btn-sm btn-link ${
                                    highlighter
                                        ? 'text-primary'
                                        : 'text-secondary'
                                }`}
                                onClick={() => setHighlighter(!highlighter)}
                            >
                                <i className="fa-solid fa-highlighter"></i>
                            </button>
                        </div>
                    </div>
                </StyledParagraphLine>
            )
        })
    }
    return (
        <main className={`container-fluid`}>
            <h1>{storyName}</h1>
            <div>
                <audio
                    controls
                    onTimeUpdate={handleTimeUpdate}
                    onLoadedData={audioLoadedData}
                >
                    <source src={audioSourceUrl} type={`audio/mp3`} />
                    Your browser does not support the audio element.
                </audio>
                <p>Current: {currentTime}</p>
                <p>
                    Loop: {timeLoop.start} / {timeLoop.end}
                </p>
            </div>
            <div>
                {captions.map((caption: Caption, idx: string) => {
                    const eleId = `p${idx}`
                    return (
                        <React.Fragment key={idx}>
                            {caption.type === 'paragraph' && (
                                <StyledParagraph id={eleId}>
                                    {parserParagraph(caption.data, eleId)}
                                </StyledParagraph>
                            )}
                        </React.Fragment>
                    )
                })}
            </div>
            {children}
        </main>
    )
}
export default StoryBook
