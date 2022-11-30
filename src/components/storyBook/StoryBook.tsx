import React, { SyntheticEvent, useEffect, useState } from 'react'
import {
    Caption,
    CaptionLine,
    CaptionTimestamp,
    TypeAudioTimeFormat
} from '../../interfaces/Caption'
import {
    StyledParagraph,
    StyledParagraphLine,
    StyledParagraphTranslation
} from '../styled/StyledParagraph'
import WordsData from '../../utils/words'
import styled from 'styled-components'

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
    end: null
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
                end: end
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
        }
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
            const storyContent = document.querySelector('.storyContent')
            if (!storyContent) return
            const paragraphs = storyContent.querySelectorAll('.storyParagraph')
            const translationTooltip = storyContent.querySelector(
                '.translationTooltip'
            )
            if (!paragraphs || !translationTooltip) return
            setCurrentLineId(null)
            paragraphs.forEach((el) => {
                if (!(el instanceof HTMLElement)) return
                const targeted =
                    audio.currentTime >= Number(el?.dataset.start) &&
                    audio.currentTime < Number(el?.dataset.end)
                const autoScroll =
                    highlighter &&
                    !translationTooltip.classList.contains('show')
                el.dataset.highlight =
                    highlighter && targeted ? 'true' : 'false'
                if (targeted) {
                    setCurrentLineId(el.id)
                    if (autoScroll) {
                        el.scrollIntoView({
                            behavior: 'smooth',
                            block: 'center',
                            inline: 'nearest'
                        })
                    }
                }
            })
        }
        if (audio) setCurrentTime(audio.currentTime)
        doLooping()
        doHighlightAndScroll()
    }
    const parserParagraph = (data: [CaptionLine], parentId: string) => {
        const charsRegExp = new RegExp(/[ ,.;:~\-=#_"'“‘()\[\]{}]/)
        return data.map((line, idx) => {
            const eleId = `${parentId}l${idx}`
            const standalone = line.standalone
            const timestampStart = line.start
            const timestampEnd = line.end
            const translation = line.translation
            let scriptContent = line.content
            WordsData.forEach((word, idx) => {
                const keyword = word.word
                const targetWordIndex = scriptContent
                    .toLowerCase()
                    .search(keyword.toLowerCase())
                const targetWordIndexPrevString = scriptContent.substring(
                    targetWordIndex - 1,
                    targetWordIndex
                )
                const targetWordIndexNextString = scriptContent.substring(
                    targetWordIndex + keyword.length,
                    targetWordIndex + keyword.length + 1
                )
                const isMatchedCharsRexExp =
                    targetWordIndexPrevString.search(charsRegExp) === 0 &&
                    targetWordIndexNextString.search(charsRegExp) === 0
                if (targetWordIndex >= 0 && isMatchedCharsRexExp) {
                    const actualWord = scriptContent.substring(
                        targetWordIndex,
                        targetWordIndex + keyword.length
                    )
                    const newWord = `<span class="translationTag" data-word-idx="${idx}">${actualWord}</span> <i class="text-danger fa-solid fa-language"></i>`
                    scriptContent = scriptContent.replace(actualWord, newWord)
                }
            })
            return (
                <StyledParagraphLine
                    key={idx}
                    standalone={standalone}
                    id={eleId}
                    className={`storyParagraph m-0 py-3 py-md-0`}
                    data-start={timestampStart}
                    data-end={timestampEnd}
                >
                    <div className={`p-2 px-3`}>
                        <StyledParagraphTranslation>
                            {translationCode &&
                                translation &&
                                translation[translationCode] && (
                                    <small>
                                        {translation[translationCode]}
                                    </small>
                                )}
                            {!translation && <small>...</small>}
                        </StyledParagraphTranslation>
                        <StyledScriptTag
                            className={`script`}
                            dangerouslySetInnerHTML={{ __html: scriptContent }}
                        ></StyledScriptTag>
                        <div>
                            <button
                                title={`Loop this one`}
                                className={`btn btn-sm btn-link`}
                                onClick={() =>
                                    audioControl.set(
                                        timestampStart,
                                        timestampEnd
                                    )
                                }
                            >
                                <i className="fa-solid fa-repeat"></i>
                            </button>
                            {(eleId !== currentLineId || audio?.paused) && (
                                <button
                                    title={`Play from here`}
                                    className={`btn btn-sm btn-link`}
                                    onClick={() =>
                                        audioControl.set(timestampStart, null)
                                    }
                                >
                                    <i className="fa-solid fa-play"></i>
                                </button>
                            )}
                            {eleId === currentLineId && !audio?.paused && (
                                <button
                                    title={`Pause`}
                                    className={`btn btn-sm btn-link`}
                                    onClick={() => audio?.pause()}
                                >
                                    <i className="fa-solid fa-pause"></i>
                                </button>
                            )}
                            <button
                                title={`Stop highlight and auto-scroll`}
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
    useEffect(() => {
        const storyContent = document.querySelector('.storyContent')
        if (!storyContent) return
        const translationTooltip = storyContent.querySelector(
            '.translationTooltip'
        )
        if (!translationTooltip) return
        const translationTags = storyContent.querySelectorAll('.translationTag')
        const handlerClick = (el: any) => {
            if (!(translationTooltip instanceof HTMLElement)) return
            const offsetTop = storyContent.getBoundingClientRect().top
            const offsetLeft = storyContent.getBoundingClientRect().left
            const elementWidth = el.target.getBoundingClientRect().width
            const elementHeight = el.target.getBoundingClientRect().height
            const wordIdx = el.target.dataset.wordIdx
            const translation = WordsData[wordIdx].translation[translationCode]
            const translationThirdParty = WordsData[wordIdx].thirdParty
            const translationWord = WordsData[wordIdx].word
            const translationThirdPartyUrls = []
            let translationToolTipLeft = 0
            let translationToolTipTop = 0

            // Reset
            translationTooltip.classList.remove('show')
            translationTooltip.innerHTML = ``
            translationTooltip.style.left = `0px`
            translationTooltip.style.top = `0px`

            // Setup
            translationTooltip.innerHTML = translation.join('')
            translationTooltip.classList.add('show')

            if (translationThirdParty) {
                if (translationThirdParty.includes('cambridge')) {
                    translationThirdPartyUrls.push(
                        `<a href="https://dictionary.cambridge.org/zht/詞典/英語-漢語-繁體/${translationWord}" target="_blank">Cambridge Dictionary</a>`
                    )
                }
                if (translationThirdParty.includes('google')) {
                    translationThirdPartyUrls.push(
                        `<a href="https://translate.google.com/?sl=en&tl=zh-TW&op=translate&text=${translationWord}" target="_blank">Google Translate</a>`
                    )
                }
                translationTooltip.innerHTML += `<div class="translatedFrom"><strong>Translated from:</strong><br>${translationThirdPartyUrls.join(
                    ''
                )}</div>`
            }

            // Position Left
            translationToolTipLeft =
                el.target.getBoundingClientRect().x -
                offsetLeft -
                translationTooltip.offsetWidth / 2 +
                elementWidth / 2
            if (translationToolTipLeft < 0) translationToolTipLeft = 0
            if (
                translationToolTipLeft + translationTooltip.offsetWidth >=
                window.innerWidth
            ) {
                translationToolTipLeft =
                    window.innerWidth - translationTooltip.offsetWidth
            }
            translationTooltip.style.left = `${translationToolTipLeft}px`

            // Position Top
            translationToolTipTop =
                el.target.getBoundingClientRect().y -
                offsetTop -
                elementHeight / 2 -
                translationTooltip.offsetHeight
            translationTooltip.style.top = `${translationToolTipTop}px`

            translationTooltip.scrollIntoView({
                behavior: 'smooth',
                block: 'start',
                inline: 'nearest'
            })
        }
        const hide = () => {
            if (!(translationTooltip instanceof HTMLElement)) return
            translationTooltip.classList.remove('show')
            translationTooltip.style.left = '-100%'
            translationTooltip.style.top = '-100%'
        }
        const handlerHideShow = (el: any) => hide()
        const handleResize = () => hide()

        translationTooltip.addEventListener('click', handlerHideShow)
        translationTags.forEach((tag) => {
            tag.addEventListener('click', handlerClick)
        })
        window.addEventListener('resize', handleResize)
        return () => {
            translationTooltip.removeEventListener('click', handlerHideShow)
            translationTags.forEach((tag) => {
                tag.removeEventListener('click', handlerClick)
            })
            window.removeEventListener('resize', handleResize)
        }
    }, [])

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
            <StyledStoryContent className={`storyContent`}>
                <StyledTranslationTooltip
                    className={`translationTooltip`}
                ></StyledTranslationTooltip>
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
            </StyledStoryContent>
            {children}
        </main>
    )
}

export default StoryBook

const StyledTranslationTooltip = styled.div`
    background: #fff;
    border: 2px solid #dc3545;
    border-radius: 10px;
    box-shadow: 0.5rem 0.5rem 0 rgba(220, 53, 69, 50%);
    display: block;
    opacity: 0;
    padding: 8px;

    position: absolute;
    top: -100%;
    left: -100%;
    z-index: 1;
    user-select: none;

    max-width: 99.9%;

    &:before {
        content: 'Dictionary';

        background-color: #dc3545;
        color: #fff;
        display: block;
        margin: -8px;
        margin-bottom: 8px;
        padding: 4px 8px;
    }

    ul,
    ol {
        padding-left: 1rem;

        i {
            color: #000;
            display: block;
            font-weight: 200;
        }
    }

    a,
    a:hover,
    .translatedFrom {
        color: #666;
        font-size: 10px;
        text-decoration: none;
    }

    &.show {
        opacity: 1;
    }
`

const StyledScriptTag = styled.div`
    > .translationTag {
        cursor: pointer;
        font-weight: bold;
        text-decoration: underline;
        position: relative;
    }
`

const StyledStoryContent = styled.div`
    position: relative;
`
