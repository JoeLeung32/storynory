import React, { useEffect, useRef, useState } from 'react'
import styled from 'styled-components'
import { graphql, useStaticQuery } from 'gatsby'
import { Caption, CaptionTimestamp } from '../../interfaces/Caption'
import { TranslationContent } from '../../interfaces/Translation'
import StoryBookParagraph from './StoryBookParagraph'
import TranslationTooltip from '../tools/tooltips/TranslationTooltip'
import TranslationBottomUp from '../tools/bottomUp/TranslationBottomUp'
import { DOMTranslationTag, DOMTranslationToolTip } from '../../utils/DOM'

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

const thirdPartyUrls = {
    cambridge: {
        name: `Cambridge Dictionary`,
        baseUrl: `https://dictionary.cambridge.org/zht/詞典/英語-漢語-繁體/`
    },
    google: {
        name: `Google Translate`,
        baseUrl: `https://translate.google.com/?sl=en&tl=zh-TW&op=translate&text=`
    }
}

const StoryBook: React.FC<Props> = (props) => {
    // Declare
    const { storyName, captions, children, translationCode } = props
    const { audioSourceUrl, handleAudio } = props
    const audioRef = useRef<HTMLAudioElement>(
        typeof window !== 'undefined' ? new Audio(audioSourceUrl) : null
    )
    const [pause, setPause] = useState(audioRef.current?.paused)
    const audio = audioRef.current
    const [timeLoop, setTimeLoop] = useState<CaptionTimestamp>()
    const [highlighter, setHighlighter] = useState<boolean>(true)
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
    const handleAudioOnTimeUpdate = () => {
        const doLooping = () => {
            if (!audio || !timeLoop) return
            if (timeLoop.start && timeLoop.start >= audio.currentTime) {
                audio.currentTime = timeLoop.start || 0
            } else if (timeLoop.end && timeLoop.end <= audio.currentTime) {
                audio.currentTime = timeLoop.start || 0
            }
        }
        const doHighlightAndScroll = () => {
            if (!audio) return
            const paragraphs = document.querySelectorAll(
                '.storyContent .storyParagraph'
            )
            const translationTooltip = document.querySelector(
                '.storyContent .translationTooltip'
            )
            if (!paragraphs || !translationTooltip) return
            const implement = (el: HTMLElement) => {
                const ct = audio.currentTime
                const ds = el?.dataset
                const isShown = translationTooltip.classList.contains('show')
                const targeted = ct >= Number(ds.start) && ct < Number(ds.end)
                const autoScroll = highlighter && !isShown
                ds.highlight = highlighter && targeted ? 'true' : 'false'
                if (!targeted) return
                setCurrentScriptId(el.id)
                if (!autoScroll) return
                el.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center',
                    inline: 'nearest'
                })
            }
            setCurrentScriptId(null)
            paragraphs.forEach((el) => {
                implement(el as HTMLElement)
            })
        }
        doLooping()
        doHighlightAndScroll()
    }
    // Life Cycle
    const effects = {
        audioInitial: () => {
            if (!audio) return
            audio.addEventListener('timeupdate', handleAudioOnTimeUpdate)
            audio.load()
            handleAudio(audio)
            return () => {
                audio.removeEventListener('timeupdate', handleAudioOnTimeUpdate)
            }
        },
        audioEventListenerRefresh: () => {
            if (!audio) return
            audio.addEventListener('timeupdate', handleAudioOnTimeUpdate)
            return () => {
                audio.removeEventListener('timeupdate', handleAudioOnTimeUpdate)
            }
        }
    }
    useEffect(effects.audioInitial, [])
    useEffect(effects.audioEventListenerRefresh, [highlighter, timeLoop])
    useEffect(() => {
        const handleClick = (el: Event) => {
            DOMTranslationToolTip.show()
            const target = el.target as HTMLElement
            const wordId = target.dataset.wordIdx
            if (!wordId) return
            const mdxData = graphqlQueryWordsMdx[wordId]
            const word = mdxData.frontmatter.title
            const refer = mdxData.frontmatter.refer
            const thirdParty =
                thirdPartyUrls[
                    mdxData.frontmatter
                        .thirdParty as keyof typeof thirdPartyUrls
                ]
            setTranslationObject({
                wordId,
                word,
                refer,
                target,
                partOfSpeech: mdxData.frontmatter.partOfSpeech,
                thirdPartyUrls: `<a href="${thirdParty.baseUrl}${word}" target="_blank">${thirdParty.name}</a>`
            })
        }
        DOMTranslationTag.unset(handleClick)
        DOMTranslationTag.setup(handleClick)
        return () => DOMTranslationTag.unset(handleClick)
    }, [])
    // Output
    return (
        <main className={`container-fluid`}>
            <h1>{storyName}</h1>
            <StyledStoryContent className={`storyContent`}>
                <TranslationTooltip
                    translationCode={translationCode}
                    translationObject={translationObject}
                    handleTranslationObject={setTranslationObject}
                ></TranslationTooltip>
                {captions.map((caption: Caption, idx: string) => (
                    <React.Fragment key={idx}>
                        {caption.type === 'paragraph' && (
                            <StoryBookParagraph
                                id={`p${idx}`}
                                data={caption.data}
                                currentScriptId={currentScriptId}
                                translationCode={translationCode}
                                wordsMdx={graphqlQueryWordsMdx}
                                audio={audio}
                                handleAudioTimeLoop={setTimeLoop}
                                pause={pause}
                                handleAudioPause={setPause}
                                highlighter={highlighter}
                                handleHighlighter={setHighlighter}
                            ></StoryBookParagraph>
                        )}
                    </React.Fragment>
                ))}
                <TranslationBottomUp
                    translationCode={translationCode}
                    translationObject={translationObject}
                ></TranslationBottomUp>
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
                    thirdParty
                    slug
                    title
                    refer
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
