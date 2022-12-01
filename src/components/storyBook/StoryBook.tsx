import React, { SyntheticEvent, useEffect, useState } from 'react'
import styled from 'styled-components'
import { graphql, useStaticQuery } from 'gatsby'
import { marked } from 'marked'
import { Caption, CaptionTimestamp } from '../../interfaces/Caption'
import { StyledTranslationTooltip } from '../styled/StyledTranslationTooltip'
import { StyledTranslationBottomUp } from '../styled/StyledTranslationButtomUp'
import StoryBookParagraph, { MdxPartOfSpeech } from './StoryBookParagraph'

interface Props {
    audioSourceUrl: string
    handleAudio: any
    storyName: string
    captions: {
        map(element: (caption: Caption, idx: string) => JSX.Element): any
    }
    translationCode: string
    children: React.ReactElement | undefined
}

interface TranslationContent {
    wordId?: string
    target?: HTMLElement
    thirdPartyUrls?: string
    partOfSpeech: MdxPartOfSpeech[]
}

const timeLoopDefault = {
    start: null,
    end: null
}

const StoryBook: React.FC<Props> = (props) => {
    // Declare
    const { storyName, captions, children, translationCode } = props
    const { audioSourceUrl, handleAudio } = props
    const [highlighter, setHighlighter] = useState<boolean>(true)
    const [audio, setAudio] = useState<HTMLAudioElement>()
    const [currentTime, setCurrentTime] = useState(0)
    const [timeLoop, setTimeLoop] = useState<CaptionTimestamp>(timeLoopDefault)
    const [currentScriptId, setCurrentScriptId] = useState<string | null>(null)
    const [translationObject, setTranslationObject] =
        useState<TranslationContent>()
    // Functions
    const graphqlQueryWordsMdx = (() => {
        const {
            allMdx: { nodes }
        } = useStaticQuery(graphqlAllMdxWords)
        return nodes
    })()
    const handleAudioOnLoadedData = (event: SyntheticEvent) => {
        const object = event.target as HTMLAudioElement
        if (!object) return
        handleAudio(object)
        setAudio(object)
    }
    const handleAudioOnTimeUpdate = () => {
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
            const sc = document.querySelector('.storyContent')
            if (!sc) return
            const paragraphs = sc.querySelectorAll('.storyParagraph')
            const translationTooltip = sc.querySelector('.translationTooltip')
            if (!paragraphs || !translationTooltip) return
            const implement = (el: HTMLElement) => {
                const ct = audio.currentTime
                const ds = el?.dataset
                const isShown = translationTooltip.classList.contains('show')
                const targeted = ct >= Number(ds.start) && ct < Number(ds.end)
                const autoScroll = highlighter && !isShown
                ds.highlight = highlighter && targeted ? 'true' : 'false'
                if (targeted) {
                    setCurrentScriptId(el.id)
                    if (autoScroll) {
                        el.scrollIntoView({
                            behavior: 'smooth',
                            block: 'center',
                            inline: 'nearest'
                        })
                    }
                }
            }
            setCurrentScriptId(null)
            paragraphs.forEach((el) => {
                if (el instanceof HTMLElement) implement(el)
            })
        }
        if (audio) setCurrentTime(audio.currentTime)
        doLooping()
        doHighlightAndScroll()
    }
    useEffect(() => {
        const sc = document.querySelector('.storyContent')
        if (!sc) return
        const translationTooltip = sc.querySelector(
            '.translationTooltip'
        ) as HTMLElement
        const translationBottomUp = sc.querySelector(
            '.translationBottomUp'
        ) as HTMLElement
        if (!translationTooltip || !translationBottomUp) return
        const translationTags = sc.querySelectorAll('.translationTag')
        const hideToolTip = () => {
            translationTooltip.classList.remove('show')
            translationTooltip.style.left = '-100%'
            translationTooltip.style.top = '-100%'
        }
        const hideBottomUp = () => {
            translationBottomUp.classList.remove('show')
        }
        const handlerHideShowTooltip = () => hideToolTip()
        const handleResize = () => hideToolTip()
        const handleClick = (el: MouseEvent) => {
            const target = el.target as HTMLElement
            const wordIdx = target.dataset.wordIdx
            if (!wordIdx) return
            const mdxData = graphqlQueryWordsMdx[wordIdx]
            const translationWord = mdxData.frontmatter.title
            let state: TranslationContent = {
                wordId: wordIdx,
                target,
                partOfSpeech: mdxData.frontmatter.partOfSpeech,
                thirdPartyUrls: ``
            }
            switch (mdxData.frontmatter.thirdParty) {
                case 'cambridge': {
                    state.thirdPartyUrls = `<a href="https://dictionary.cambridge.org/zht/詞典/英語-漢語-繁體/${translationWord}" target="_blank">Cambridge Dictionary</a>`
                    break
                }
                case 'google': {
                    state.thirdPartyUrls = `<a href="https://translate.google.com/?sl=en&tl=zh-TW&op=translate&text=${translationWord}" target="_blank">Google Translate</a>`
                    break
                }
                default: {
                    state.thirdPartyUrls = ``
                    break
                }
            }
            setTranslationObject(state)
            hideBottomUp()
        }
        const handleShowMore = (el: MouseEvent) => {
            const target = el.target as HTMLElement
            const parentWrap = target.closest(
                '.translationTooltip'
            ) as HTMLElement
            if (!parentWrap) return
            const wordIdx = parentWrap.dataset.wordId
            translationBottomUp.dataset.wordId = wordIdx
            translationBottomUp.classList.add('show')
            translationBottomUp
                .querySelector('.btnClose')
                ?.addEventListener('click', hideBottomUp)
            hideToolTip()
        }
        const reset = () => {
            translationTags.forEach((tag) => {
                tag.removeEventListener('click', (el) => {
                    if (el instanceof PointerEvent) handleClick(el)
                })
            })
            translationTooltip
                .querySelector('.translationTooltipShowMore')
                ?.removeEventListener('click', (el) => {
                    if (el instanceof PointerEvent) handleShowMore(el)
                })
            translationTooltip
                .querySelector('.btnClose')
                ?.removeEventListener('click', handlerHideShowTooltip)
            // translationTooltip.removeEventListener('click', handlerHideShowTooltip)
            window.removeEventListener('resize', handleResize)
        }

        reset()
        translationTags.forEach((tag) => {
            tag.addEventListener('click', (el) => {
                if (el instanceof MouseEvent) handleClick(el)
            })
        })
        translationTooltip
            .querySelector('.translationTooltipShowMore')
            ?.addEventListener('click', (el) => {
                if (el instanceof MouseEvent) handleShowMore(el)
            })
        translationTooltip
            .querySelector('.btnClose')
            ?.addEventListener('click', handlerHideShowTooltip)
        // translationTooltip.addEventListener('click', handlerHideShowTooltip)
        window.addEventListener('resize', handleResize)
        return () => reset()
    }, [])
    useEffect(() => {
        if (!translationObject || !translationObject.target) return
        const { target } = translationObject
        const storyContent = document.querySelector('.storyContent')
        if (!storyContent) return
        const translationTooltip = storyContent.querySelector(
            '.translationTooltip'
        ) as HTMLElement
        const offsetTop = storyContent.getBoundingClientRect().top
        const offsetLeft = storyContent.getBoundingClientRect().left
        const elementWidth = target.getBoundingClientRect().width
        const elementHeight = target.getBoundingClientRect().height
        let translationToolTipLeft = 0
        let translationToolTipTop = 0

        // Position Left
        translationToolTipLeft =
            target.getBoundingClientRect().x -
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
            target.getBoundingClientRect().y -
            offsetTop -
            elementHeight / 2 -
            translationTooltip.offsetHeight
        translationTooltip.style.top = `${translationToolTipTop}px`

        translationTooltip.classList.add('show')
        translationTooltip.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
            inline: 'nearest'
        })
        return () => {
            translationTooltip.classList.remove('show')
            translationTooltip.style.left = '-100%'
            translationTooltip.style.top = '-100%'
        }
    }, [translationObject])

    // @ts-ignore
    // @ts-ignore
    return (
        <main className={`container-fluid`}>
            <h1>{storyName}</h1>
            <div>
                <audio
                    controls
                    preload={`auto`}
                    onLoadedData={handleAudioOnLoadedData}
                    onTimeUpdate={handleAudioOnTimeUpdate}
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
                    data-word-id={translationObject?.wordId}
                >
                    <header className={`d-flex justify-content-between`}>
                        <div>Dictionary</div>
                        <div className={`btnClose`}>
                            <i className="fa-solid fa-xmark"></i>
                        </div>
                    </header>
                    <div className={`p-2`}>
                        <div className={`mb-2 content`}>
                            <p className="badge bg-primary m-0">
                                {translationObject?.partOfSpeech[0].type}
                            </p>
                            <p className={`m-0 fw-bold`}>
                                {translationObject &&
                                    marked.parseInline(
                                        translationObject.partOfSpeech[0].en
                                    )}
                            </p>
                            <p className={`m-0`}>
                                {translationObject &&
                                    marked.parseInline(
                                        translationObject.partOfSpeech[0][
                                            translationCode
                                        ]
                                    )}
                            </p>
                        </div>
                        <div className={`mb-2`}>
                            <button
                                className={`translationTooltipShowMore btn btn-sm btn-info`}
                            >
                                Show More
                            </button>
                        </div>
                        <div className={`translatedFrom`}>
                            <strong>Translated from:</strong>
                            <div
                                dangerouslySetInnerHTML={{
                                    __html:
                                        translationObject?.thirdPartyUrls || ''
                                }}
                            ></div>
                        </div>
                    </div>
                </StyledTranslationTooltip>
                {captions.map((caption: Caption, idx: string) => {
                    const eleId = `p${idx}`
                    return (
                        <React.Fragment key={idx}>
                            {caption.type === 'paragraph' && (
                                <StoryBookParagraph
                                    id={eleId}
                                    data={caption.data}
                                    currentScriptId={currentScriptId}
                                    translationCode={translationCode}
                                    wordsMdx={graphqlQueryWordsMdx}
                                    audio={audio}
                                    handleAudioTimeLoop={setTimeLoop}
                                    handleHighlighter={setHighlighter}
                                ></StoryBookParagraph>
                            )}
                        </React.Fragment>
                    )
                })}
                <StyledTranslationBottomUp
                    className={`translationBottomUp`}
                    data-word-id={`null`}
                >
                    <header className={`d-flex justify-content-between`}>
                        <div>Dictionary</div>
                        <div className={`btnClose`}>
                            <i className="fa-solid fa-xmark"></i>
                        </div>
                    </header>
                    <div className={`p-2`}>
                        <div className={`mb-2 content`}>
                            {translationObject?.partOfSpeech.map((data) => {
                                return (
                                    <>
                                        <p className="badge bg-primary m-0">
                                            {data.type}
                                        </p>
                                        <p className={`m-0 fw-bold`}>
                                            {translationObject &&
                                                marked.parseInline(data.en)}
                                        </p>
                                        <p className={`m-0`}>
                                            {translationObject &&
                                                marked.parseInline(
                                                    data[translationCode]
                                                )}
                                        </p>
                                        <ul className={`mt-2`}>
                                            {data.examples.map((li) => (
                                                <li>
                                                    <i>{li.en}</i>
                                                    <br />
                                                    {li[translationCode]}
                                                </li>
                                            ))}
                                        </ul>
                                        {data.moreExamples && (
                                            <div className={`bg-info mt-2 p-2`}>
                                                <p className={`m-0 fw-bold`}>
                                                    More Examples
                                                </p>
                                                <ul className={`m-0`}>
                                                    {data.moreExamples.map(
                                                        (li) => (
                                                            <li>{li}</li>
                                                        )
                                                    )}
                                                </ul>
                                            </div>
                                        )}
                                    </>
                                )
                            })}
                        </div>
                        <div className={`translatedFrom`}>
                            <strong>Translated from:</strong>
                            <div
                                dangerouslySetInnerHTML={{
                                    __html:
                                        translationObject?.thirdPartyUrls || ''
                                }}
                            ></div>
                        </div>
                    </div>
                </StyledTranslationBottomUp>
            </StyledStoryContent>
            {children}
        </main>
    )
}

export default StoryBook

const StyledStoryContent = styled.div`
    position: relative;
`

const graphqlAllMdxWords = graphql`
    {
        allMdx {
            nodes {
                frontmatter {
                    slug
                    title
                    thirdParty
                    partOfSpeech {
                        type
                        en
                        tc
                        examples {
                            en
                            tc
                        }
                        moreExamples
                    }
                }
                body
            }
        }
    }
`
